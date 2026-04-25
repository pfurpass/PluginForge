export const welcomeXml = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="event_player_join" x="40" y="40">
    <statement name="DO">
      <block type="player_send_message">
        <value name="MESSAGE">
          <shadow type="text"><field name="TEXT">Willkommen auf dem Server!</field></shadow>
        </value>
        <value name="PLAYER">
          <block type="player_event"></block>
        </value>
        <next>
          <block type="player_give_item">
            <field name="MATERIAL">DIAMOND</field>
            <value name="AMOUNT">
              <shadow type="math_number"><field name="NUM">1</field></shadow>
            </value>
            <value name="PLAYER">
              <block type="player_event"></block>
            </value>
            <next>
              <block type="player_broadcast">
                <value name="MESSAGE">
                  <shadow type="text"><field name="TEXT">Ein neuer Spieler ist da!</field></shadow>
                </value>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`;
