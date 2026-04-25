export const minigameXml = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="event_block_break" x="40" y="40">
    <statement name="DO">
      <block type="controls_if">
        <value name="IF0">
          <block type="logic_compare">
            <field name="OP">LT</field>
            <value name="A">
              <block type="math_random_int">
                <value name="FROM">
                  <shadow type="math_number"><field name="NUM">1</field></shadow>
                </value>
                <value name="TO">
                  <shadow type="math_number"><field name="NUM">100</field></shadow>
                </value>
              </block>
            </value>
            <value name="B">
              <shadow type="math_number"><field name="NUM">50</field></shadow>
            </value>
          </block>
        </value>
        <statement name="DO0">
          <block type="world_strike_lightning">
            <value name="X">
              <block type="event_block_location"><field name="AXIS">X</field></block>
            </value>
            <value name="Y">
              <block type="event_block_location"><field name="AXIS">Y</field></block>
            </value>
            <value name="Z">
              <block type="event_block_location"><field name="AXIS">Z</field></block>
            </value>
            <next>
              <block type="player_send_message">
                <value name="MESSAGE">
                  <shadow type="text"><field name="TEXT">Du hattest Glück (oder Pech)!</field></shadow>
                </value>
                <value name="PLAYER">
                  <block type="player_event"></block>
                </value>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </statement>
  </block>
</xml>`;
