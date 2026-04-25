import type { Platform, PluginMeta } from '../types';
import type { GeneratorOutput } from '../blockly/generators/base';

export function pomXml(platform: Platform, meta: PluginMeta): string {
  const groupId = meta.mainPackage;
  const artifactId = meta.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');

  if (platform === 'paper') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>${groupId}</groupId>
    <artifactId>${artifactId}</artifactId>
    <version>${meta.version}</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <repositories>
        <repository>
            <id>papermc</id>
            <url>https://repo.papermc.io/repository/maven-public/</url>
        </repository>
    </repositories>

    <dependencies>
        <dependency>
            <groupId>io.papermc.paper</groupId>
            <artifactId>paper-api</artifactId>
            <version>${meta.apiVersion}-R0.1-SNAPSHOT</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>${artifactId}-${'${project.version}'}</finalName>
        <resources>
            <resource>
                <directory>src/main/resources</directory>
                <filtering>true</filtering>
            </resource>
        </resources>
    </build>
</project>
`;
  }

  if (platform === 'spigot') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>${groupId}</groupId>
    <artifactId>${artifactId}</artifactId>
    <version>${meta.version}</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <repositories>
        <repository>
            <id>spigotmc-repo</id>
            <url>https://hub.spigotmc.org/nexus/content/repositories/snapshots/</url>
        </repository>
        <repository>
            <id>sonatype</id>
            <url>https://oss.sonatype.org/content/groups/public/</url>
        </repository>
    </repositories>

    <dependencies>
        <dependency>
            <groupId>org.spigotmc</groupId>
            <artifactId>spigot-api</artifactId>
            <version>${meta.apiVersion}-R0.1-SNAPSHOT</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>${artifactId}-${'${project.version}'}</finalName>
        <resources>
            <resource>
                <directory>src/main/resources</directory>
                <filtering>true</filtering>
            </resource>
        </resources>
    </build>
</project>
`;
  }

  if (platform === 'velocity') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>${groupId}</groupId>
    <artifactId>${artifactId}</artifactId>
    <version>${meta.version}</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <repositories>
        <repository>
            <id>papermc</id>
            <url>https://repo.papermc.io/repository/maven-public/</url>
        </repository>
    </repositories>

    <dependencies>
        <dependency>
            <groupId>com.velocitypowered</groupId>
            <artifactId>velocity-api</artifactId>
            <version>${meta.apiVersion}-SNAPSHOT</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>${artifactId}-${'${project.version}'}</finalName>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.13.0</version>
                <configuration>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>com.velocitypowered</groupId>
                            <artifactId>velocity-api</artifactId>
                            <version>${meta.apiVersion}-SNAPSHOT</version>
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
`;
  }

  // bungee
  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>${groupId}</groupId>
    <artifactId>${artifactId}</artifactId>
    <version>${meta.version}</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <repositories>
        <repository>
            <id>sonatype</id>
            <url>https://oss.sonatype.org/content/repositories/snapshots/</url>
        </repository>
    </repositories>

    <dependencies>
        <dependency>
            <groupId>net.md-5</groupId>
            <artifactId>bungeecord-api</artifactId>
            <version>1.21-R0.2-SNAPSHOT</version>
            <type>pom</type>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>${artifactId}-${'${project.version}'}</finalName>
        <resources>
            <resource>
                <directory>src/main/resources</directory>
                <filtering>true</filtering>
            </resource>
        </resources>
    </build>
</project>
`;
}

export function pluginYml(platform: Platform, meta: PluginMeta, out: GeneratorOutput): string {
  const className = meta.name.replace(/[^a-zA-Z0-9]/g, '');
  const main = `${meta.mainPackage}.${className.charAt(0).toUpperCase() + className.slice(1)}`;

  if (platform === 'paper') {
    let yml = `name: ${meta.name}
version: '${meta.version}'
main: ${main}
api-version: '${meta.apiVersion}'
authors: ['${meta.author}']
description: ${escYaml(meta.description)}
`;
    if (out.commands.length) {
      yml += 'commands:\n';
      for (const c of out.commands) {
        yml += `  ${c.name}:\n    description: ${escYaml(c.description || c.name)}\n`;
      }
    }
    return yml;
  }

  if (platform === 'spigot') {
    let yml = `name: ${meta.name}
version: '${meta.version}'
main: ${main}
api-version: '${meta.apiVersion}'
author: ${meta.author}
description: ${escYaml(meta.description)}
`;
    if (out.commands.length) {
      yml += 'commands:\n';
      for (const c of out.commands) {
        yml += `  ${c.name}:\n    description: ${escYaml(c.description || c.name)}\n`;
      }
    }
    return yml;
  }

  if (platform === 'bungee') {
    return `name: ${meta.name}
version: '${meta.version}'
main: ${main}
author: ${meta.author}
description: ${escYaml(meta.description)}
`;
  }

  return '';
}

export function configYml(): string {
  return `# Plugin configuration\n# Add your default config keys here.\nexample-key: example-value\n`;
}

export function readme(meta: PluginMeta, platform: Platform): string {
  return `# ${meta.name}

${meta.description}

**Author:** ${meta.author}
**Version:** ${meta.version}
**Platform:** ${platform}
**API:** ${meta.apiVersion}

## Build

\`\`\`bash
mvn package
\`\`\`

The compiled \`.jar\` will be in \`target/\`. Drop it into your server's \`plugins/\` folder.

## Generated by

[PluginForge](https://github.com/) — visual block editor for Minecraft plugins.
`;
}

function escYaml(s: string): string {
  if (!s) return '""';
  return JSON.stringify(s);
}
