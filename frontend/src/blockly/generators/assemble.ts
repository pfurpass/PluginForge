import type { Platform, PluginMeta } from '../../types';
import type { GeneratorOutput } from './base';

const shortName = (fqn: string) => fqn.substring(fqn.lastIndexOf('.') + 1);

function indent(s: string, n = 1): string {
  const pad = '    '.repeat(n);
  return s
    .split('\n')
    .map((l) => (l ? pad + l : l))
    .join('\n');
}

export function assembleMainJava(
  platform: Platform,
  meta: PluginMeta,
  out: GeneratorOutput
): string {
  switch (platform) {
    case 'paper':
    case 'spigot':
      return assembleBukkit(platform, meta, out);
    case 'velocity':
      return assembleVelocity(meta, out);
    case 'bungee':
      return assembleBungee(meta, out);
  }
}

function assembleBukkit(
  platform: Platform,
  meta: PluginMeta,
  out: GeneratorOutput
): string {
  const className = sanitizeClass(meta.name);
  const pkg = meta.mainPackage;

  const imports = new Set<string>(out.imports);
  imports.add('org.bukkit.plugin.java.JavaPlugin');
  imports.add('org.bukkit.event.Listener');
  imports.add('org.bukkit.command.Command');
  imports.add('org.bukkit.command.CommandSender');
  imports.add('org.bukkit.command.CommandExecutor');
  if (out.helpers.size) {
    imports.add('org.bukkit.inventory.ItemStack');
    imports.add('org.bukkit.inventory.meta.ItemMeta');
    imports.add('java.util.function.Consumer');
  }

  const importLines = Array.from(imports)
    .filter((i) => !i.startsWith(pkg + '.'))
    .sort()
    .map((i) => `import ${i};`)
    .join('\n');

  const listeners = out.listeners.join('\n');
  const fields = out.fields.join('\n');

  const cmdRegistrations = out.commands
    .map(
      (c) =>
        `if (getCommand("${c.name}") != null) getCommand("${c.name}").setExecutor(this);`
    )
    .join('\n');

  const cmdHandler = out.commands.length
    ? `
@Override
public boolean onCommand(CommandSender sender, Command cmd, String label, String[] args) {
${out.commands
  .map(
    (c) => `    if (cmd.getName().equalsIgnoreCase("${c.name}")) {
${indent(c.body, 2)}
        return true;
    }`
  )
  .join('\n')}
    return false;
}
`
    : '';

  const onEnableExtras = out.onEnable.join('\n');
  const onDisableExtras = out.onDisable.join('\n');

  const implementsClause = out.commands.length
    ? 'extends JavaPlugin implements Listener, CommandExecutor'
    : 'extends JavaPlugin implements Listener';

  const helperMethods: string[] = [];
  const helperFields: string[] = [];
  if (out.helpers.has('withMeta')) {
    helperMethods.push(
      `private static ItemStack __withMeta(ItemStack it, Consumer<ItemMeta> fn) {
    if (it == null) return null;
    ItemMeta m = it.getItemMeta();
    if (m != null) { fn.accept(m); it.setItemMeta(m); }
    return it;
}`
    );
  }
  if (out.helpers.has('withItem')) {
    helperMethods.push(
      `private static ItemStack __withItem(ItemStack it, Consumer<ItemStack> fn) {
    if (it != null) fn.accept(it);
    return it;
}`
    );
  }
  if (out.helpers.has('fillBorders')) {
    helperMethods.push(
      `private static void __fillBorders(org.bukkit.inventory.Inventory inv, ItemStack item) {
    int size = inv.getSize();
    int rows = size / 9;
    for (int i = 0; i < size; i++) {
        int row = i / 9, col = i % 9;
        if (row == 0 || row == rows - 1 || col == 0 || col == 8) inv.setItem(i, item);
    }
}`
    );
  }
  if (out.helpers.has('pdcKey')) {
    helperMethods.push(
      `private org.bukkit.NamespacedKey __pdcKey(String name) {
    return new org.bukkit.NamespacedKey(this, name);
}`
    );
  }
  if (out.helpers.has('num')) {
    helperMethods.push(
      `private static double __num(Object o) {
    if (o == null) return 0.0;
    if (o instanceof Number n) return n.doubleValue();
    if (o instanceof Boolean b) return b ? 1.0 : 0.0;
    try { return Double.parseDouble(String.valueOf(o)); } catch (Exception e) { return 0.0; }
}`
    );
  }
  if (out.helpers.has('itemName')) {
    helperMethods.push(
      `private static String __itemName(ItemStack it) {
    if (it == null) return "";
    if (it.hasItemMeta() && it.getItemMeta().hasDisplayName()) {
        net.kyori.adventure.text.Component c = it.getItemMeta().displayName();
        if (c != null) return net.kyori.adventure.text.serializer.plain.PlainTextComponentSerializer.plainText().serialize(c);
    }
    return it.getType().name();
}`
    );
  }
  if (out.helpers.has('scoreboard')) {
    helperFields.push(
      `private final java.util.Map<java.util.UUID, org.bukkit.scoreboard.Scoreboard> __sb = new java.util.HashMap<>();`
    );
    helperMethods.push(
      `private void __createSidebar(org.bukkit.entity.Player p, String title) {
    org.bukkit.scoreboard.Scoreboard sb = org.bukkit.Bukkit.getScoreboardManager().getNewScoreboard();
    org.bukkit.scoreboard.Objective obj = sb.registerNewObjective("sb_" + Math.abs(p.getUniqueId().hashCode() % 100000), "dummy", title);
    obj.setDisplaySlot(org.bukkit.scoreboard.DisplaySlot.SIDEBAR);
    p.setScoreboard(sb);
    __sb.put(p.getUniqueId(), sb);
}
private void __setSidebarLine(org.bukkit.entity.Player p, int line, String text) {
    org.bukkit.scoreboard.Scoreboard sb = __sb.get(p.getUniqueId());
    if (sb == null) { __createSidebar(p, "Info"); sb = __sb.get(p.getUniqueId()); }
    org.bukkit.scoreboard.Objective obj = null;
    for (org.bukkit.scoreboard.Objective o : sb.getObjectives()) { if (o.getDisplaySlot() == org.bukkit.scoreboard.DisplaySlot.SIDEBAR) { obj = o; break; } }
    if (obj == null) return;
    // Use the line index as the score. Each line needs a unique entry string.
    String entry = String.format("%-" + Math.max(1, 16 - line) + "s", " ").substring(0, Math.min(15, 16 - Math.min(15, line))) + line;
    // Reset previous entry on this score line (simple approach: clear by score range)
    for (String existing : sb.getEntries()) { if (obj.getScore(existing).getScore() == line) sb.resetScores(existing); }
    obj.getScore(text).setScore(line);
}`
    );
  }
  if (out.helpers.has('bossbar')) {
    helperFields.push(
      `private final java.util.Map<java.util.UUID, org.bukkit.boss.BossBar> __bb = new java.util.HashMap<>();`
    );
    helperMethods.push(
      `private void __showBossBar(org.bukkit.entity.Player p, String title, String color, double progress) {
    org.bukkit.boss.BarColor c;
    try { c = org.bukkit.boss.BarColor.valueOf(color); } catch (Exception ex) { c = org.bukkit.boss.BarColor.PURPLE; }
    org.bukkit.boss.BossBar bb = __bb.get(p.getUniqueId());
    if (bb == null) {
        bb = org.bukkit.Bukkit.createBossBar(title, c, org.bukkit.boss.BarStyle.SOLID);
        __bb.put(p.getUniqueId(), bb);
    } else {
        bb.setTitle(title); bb.setColor(c);
    }
    bb.setProgress(Math.max(0, Math.min(1, progress)));
    bb.addPlayer(p);
    bb.setVisible(true);
}
private void __hideBossBar(org.bukkit.entity.Player p) {
    org.bukkit.boss.BossBar bb = __bb.remove(p.getUniqueId());
    if (bb != null) { bb.removeAll(); bb.setVisible(false); }
}`
    );
  }
  const helpersBlock = [...helperFields, ...helperMethods].join('\n\n');

  return `package ${pkg};

${importLines}

public class ${className} ${implementsClause} {

${indent(fields)}

    @Override
    public void onEnable() {
        getServer().getPluginManager().registerEvents(this, this);
${indent(cmdRegistrations, 2)}
        saveDefaultConfig();
${indent(onEnableExtras, 2)}
        getLogger().info("${meta.name} enabled");
    }

    @Override
    public void onDisable() {
${indent(onDisableExtras, 2)}
        getLogger().info("${meta.name} disabled");
    }

${indent(listeners)}
${indent(cmdHandler)}
${indent(helpersBlock)}
}
`;
}

function assembleVelocity(meta: PluginMeta, out: GeneratorOutput): string {
  const className = sanitizeClass(meta.name);
  const pkg = meta.mainPackage;

  const imports = new Set<string>(out.imports);
  imports.add('com.google.inject.Inject');
  imports.add('com.velocitypowered.api.event.Subscribe');
  imports.add('com.velocitypowered.api.event.proxy.ProxyInitializeEvent');
  imports.add('com.velocitypowered.api.plugin.Plugin');
  imports.add('com.velocitypowered.api.proxy.ProxyServer');
  imports.add('org.slf4j.Logger');

  const importLines = Array.from(imports)
    .filter((i) => !i.startsWith(pkg + '.'))
    .sort()
    .map((i) => `import ${i};`)
    .join('\n');

  const listeners = out.listeners.join('\n');
  const fields = out.fields.join('\n');
  const onEnableExtras = out.onEnable.join('\n');

  // Velocity does not have JavaPlugin commands the same way; for simplicity register nothing
  return `package ${pkg};

${importLines}

@Plugin(id = "${meta.name.toLowerCase()}", name = "${meta.name}", version = "${meta.version}", authors = {"${meta.author}"})
public class ${className} {

    private final ProxyServer server;
    private final Logger logger;

${indent(fields)}

    @Inject
    public ${className}(ProxyServer server, Logger logger) {
        this.server = server;
        this.logger = logger;
    }

    @Subscribe
    public void onProxyInit(ProxyInitializeEvent event) {
${indent(onEnableExtras, 2)}
        logger.info("${meta.name} enabled");
    }

${indent(listeners)}
}
`;
}

function assembleBungee(meta: PluginMeta, out: GeneratorOutput): string {
  const className = sanitizeClass(meta.name);
  const pkg = meta.mainPackage;

  const imports = new Set<string>(out.imports);
  imports.add('net.md_5.bungee.api.plugin.Plugin');
  imports.add('net.md_5.bungee.api.plugin.Listener');

  const importLines = Array.from(imports)
    .filter((i) => !i.startsWith(pkg + '.'))
    .sort()
    .map((i) => `import ${i};`)
    .join('\n');

  const listeners = out.listeners.join('\n');
  const fields = out.fields.join('\n');
  const onEnableExtras = out.onEnable.join('\n');
  const onDisableExtras = out.onDisable.join('\n');

  return `package ${pkg};

${importLines}

public class ${className} extends Plugin implements Listener {

${indent(fields)}

    @Override
    public void onEnable() {
        getProxy().getPluginManager().registerListener(this, this);
${indent(onEnableExtras, 2)}
        getLogger().info("${meta.name} enabled");
    }

    @Override
    public void onDisable() {
${indent(onDisableExtras, 2)}
        getLogger().info("${meta.name} disabled");
    }

${indent(listeners)}
}
`;
}

export function sanitizeClass(name: string): string {
  let n = (name || 'Plugin').replace(/[^a-zA-Z0-9]/g, '');
  if (/^[0-9]/.test(n)) n = 'P' + n;
  if (n.length === 0) n = 'Plugin';
  return n.charAt(0).toUpperCase() + n.slice(1);
}
