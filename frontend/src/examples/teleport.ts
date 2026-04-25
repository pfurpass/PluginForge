export const teleportXml = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="command_define" x="40" y="40">
    <field name="NAME">spawn</field>
    <field name="DESC">Teleport to spawn</field>
    <statement name="DO">
      <block type="player_teleport">
        <value name="PLAYER">
          <block type="command_sender"></block>
        </value>
        <value name="X">
          <shadow type="math_number"><field name="NUM">0</field></shadow>
        </value>
        <value name="Y">
          <shadow type="math_number"><field name="NUM">100</field></shadow>
        </value>
        <value name="Z">
          <shadow type="math_number"><field name="NUM">0</field></shadow>
        </value>
        <next>
          <block type="player_send_message">
            <value name="MESSAGE">
              <shadow type="text"><field name="TEXT">Teleportiert!</field></shadow>
            </value>
            <value name="PLAYER">
              <block type="command_sender"></block>
            </value>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`;
