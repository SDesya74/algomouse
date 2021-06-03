<template>
  <q-page :class="{
    row: true,
    'items-center': true,
    'column': true,
    'justify-evenly': true
    }"
  >
    <div class="row text-h2">
      {{ $t("level") }} {{ currentLevel + 1 }}
    </div>
    <div class="column">
      <div class="row">
        <div class="column items-center justify-evenly" :style="{
        width: `${mapToRender[0].length * 46}px`,
        height: `${mapToRender.length * 46}px`
        }"
        >
          <div class="row">
            <div v-for="(row, y) in mapToRender" class="row">
              <div v-for="(cell, x) in row" class="column">
                <div :class="{
                'cell': true,
                'items-center': true,
                'justify-evenly': true,
                'column': true,
                'glowing-star': stars && stars.find(e => e.x === x && e.y === y),
                ...getCellColor(cell),
                'glowing': cell === 'T'
              }"
                >
                  <div v-if="player.x === x && player.y === y">
                    <q-icon color="primary" name="eva-navigation" size="32px" :class="{
                    'rotate-270': player.direction.x === Direction.LEFT.x && player.direction.y === Direction.LEFT.y,
                    'rotate-90': player.direction.x === Direction.RIGHT.x && player.direction.y === Direction.RIGHT.y,
                    'rotate-180': player.direction.x === Direction.DOWN.x && player.direction.y === Direction.DOWN.y,
                  }"
                    />
                  </div>
                  <div v-else-if="stars && stars.find(e => e.x === x && e.y === y)">
                    <q-icon color="amber-7" name="eva-star" size="32px"/>
                  </div>
                  <div v-else-if="cell === 'T'">
                    <q-icon color="cyan-9" name="eva-flag" size="32px"/>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="q-pt-sm column items-center justify-evenly">
        <div class="text-center text-bold"> {{ paused ? $t("start") : $t("stop") }}</div>
        <q-btn :icon="paused ? 'play_arrow' : 'stop'" round @click="toggle"/>
      </div>
    </div>

    <div style="display: flex; justify-content: stretch;">
      <div class="column">
        <div class="text-center">{{ $t("palette")}}</div>
        <Container
          behaviour="copy"
          group-name="1"
          :get-child-payload="index => availableCommands[index]"
        >
          <Draggable
            v-for="(command, index) in availableCommands"
            :key="index + 'c'"
          >
            <div :class="{
              'cell': true,
              'draggable-item': true,
              'bg-grey-4': command !== 'red' && command !== 'green',
              'items-center': true,
              'justify-evenly': true,
              'column': true,
              'bg-red-4': command === 'red',
              'bg-green-4': command === 'green'
            }"
            >
              <q-icon v-if="command === 'forward'" name="eva-arrowhead-right" size="32px"/>
              <q-icon v-else-if="command === 'left'" name="eva-corner-up-left" size="32px"/>
              <q-icon v-else-if="command === 'right'" name="eva-corner-up-right" size="32px"/>
              <q-icon v-else-if="command === 'red' || command === 'green'" name="eva-question-mark" size="32px"/>
            </div>
          </Draggable>
        </Container>
      </div>

      <div class="q-ml-xl column">
        <div class="text-center">{{ $t("actions")}}</div>
        <Container
          class="cell-width bg-grey-2"
          :style="{ 'height': `${bars * 46}px`}"
          group-name="1"
          :get-child-payload="index => currentCommands[index]"
          @drop="onDropToHotbar"
          :should-accept-drop="({behaviour}) => currentCommands.length < bars || behaviour !== 'copy'"
        >
          <Draggable v-for="(command, index) in currentCommands" :key="index">
            <div :class="{
              'cell': true,
              'draggable-item': true,
              'bg-grey-4': (command !== 'red' && command !== 'green') && (paused || commandIndex !== index),
              'bg-light-green-14': !paused && commandIndex === index,
              'items-center': true,
              'justify-evenly': true,
              'column': true,
              'bg-red-4': command === 'red',
              'bg-green-4': command === 'green'
            }"
            >
              <q-icon v-if="command === 'forward'" name="eva-arrowhead-right" size="32px"/>
              <q-icon v-else-if="command === 'left'" name="eva-corner-up-left" size="32px"/>
              <q-icon v-else-if="command === 'right'" name="eva-corner-up-right" size="32px"/>
              <q-icon v-else-if="command === 'red' || command === 'green'" name="eva-question-mark" size="32px"/>
            </div>
          </Draggable>
        </Container>
      </div>
      <div class="column q-ml-xl">
        <div class="text-center"> {{ $t("delete") }}</div>
        <div style="height: 72px; width: 72px; border-radius: 5px" class="row bg-negative">
          <q-icon
            name="eva-trash-outline"
            size="32px"
            style="position: absolute; height: 72px; width: 72px"
          />
          <Container
            style="height: 72px; width: 72px"
            animate-drop="false"
            group-name="1"
            :should-animate-drop="() => false"
          >
            <Draggable>
            </Draggable>
          </Container>
        </div>
      </div>
    </div>

    <q-dialog ref="defeatDialog" persistent>
      <q-card class="q-dialog-plugin">
        <q-card-section>
          <div class="text-h5"> {{$t("lost") }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" :label="$t('reset')" @click="stop" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog ref="winDialog" persistent>
      <q-card class="q-dialog-plugin">
        <q-card-section>
          <div class="text-h5"> {{ $t("win") }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" :label="$t('nextlevel')" @click="nextLevel" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
  import { defineComponent, ref } from "@vue/composition-api"
  import { Container, Draggable } from "vue-smooth-dnd"
  import { QDialog } from "quasar"

  type Point = { x: number, y: number }
  const Direction = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
  }

  type Player = {
    direction: Point
  } & Point

  type Level = {
    map: string,
    player: Player,
    stars?: Point[],
    commands: {
      bars: number,
      available: string[]
    }
  }

  const levels: Level[] = [
    /*{
      map: `
      .......
      ...g...
      ...p...
      .pprpg.
      ...p...
      ...T...
      .......
      `,
      player: {
        x: 1,
        y: 3,
        direction: Direction.RIGHT
      },
      stars: [ { x: 3, y: 1 }, { x: 5, y: 3 } ],
      commands: {
        bars: 3,
        available: [ "forward", "right", "left", "red", "green" ]
      }
    },*/

    {
      map: `
      .......
      .......
      .ppppT.
      .......
      .......
      `,
      player: {
        x: 1,
        y: 2,
        direction: Direction.RIGHT
      },
      stars: [ { x: 3, y: 2 } ],
      commands: {
        bars: 1,
        available: [ "forward", "left", "right" ]
      }
    },
    {
      map: `
      .....
      .ppp.
      ...p.
      ...T.
      .....
      `,
      player: {
        x: 1,
        y: 1,
        direction: Direction.RIGHT
      },
      stars: [ { x: 3, y: 1 } ],
      commands: {
        bars: 3,
        available: [ "forward", "right" ]
      }
    },
    {
      map: `
      .......
      .pp....
      ..pp...
      ...pp..
      ....pT.
      .......
      `,
      player: {
        x: 1,
        y: 1,
        direction: Direction.RIGHT
      },
      stars: [ { x: 2, y: 1 }, { x: 3, y: 2 }, { x: 4, y: 3 } ],
      commands: {
        bars: 4,
        available: [ "forward", "left", "right" ]
      }
    },
    {
      map: `
      .....
      .ppr.
      ...p.
      .Tpr.
      .....
      `,
      player: {
        x: 1,
        y: 1,
        direction: Direction.RIGHT
      },
      stars: [ { x: 2, y: 1 }, { x: 3, y: 2 }, { x: 2, y: 3 } ],
      commands: {
        bars: 3,
        available: [ "forward", "right", "red" ]
      }
    },
    {
      map: `
      .......
      .p.rpr.
      .p.p.p.
      .p.T.p.
      .p...p.
      .rpppr.
      .......
      `,
      player: {
        x: 1,
        y: 1,
        direction: Direction.DOWN
      },
      stars: [ { x: 3, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 5 }, { x: 1, y: 5} ],
      commands: {
        bars: 3,
        available: [ "forward", "right", "left", "red" ]
      }
    }
  ]

  export default defineComponent({
    name: "PageIndex",
    components: { Container, Draggable },
    setup() {
      const level = ref()
      const map = ref()
      const mapToRender = ref()
      const startPlayerPosition = ref()
      const startStars = ref()
      const availableCommands = ref()
      const bars = ref()

      const currentLevel = ref(0)

      function setLevel(n: number) {
        level.value = levels[n]
        const lvl = level.value
        map.value = lvl.map
        startPlayerPosition.value = { ...lvl.player }
        startStars.value = [ ...lvl.stars ?? [] ]
        availableCommands.value = lvl.commands.available
        bars.value = lvl.commands.bars

        map.value = map.value.trim().split("\n").map((e: string) => e.trim()).join("\n")
        mapToRender.value = map.value.split("\n").map((e: string) => e.split(""))
      }

      setLevel(currentLevel.value)

      const currentCommands = ref<string[]>([])
      const commandIndex = ref(0)
      let stars = ref<any[]>()
      let player = ref<Player>()

      function reset() {
        player.value = { ...startPlayerPosition.value }
        stars.value = [ ...startStars.value ?? [] ]
        commandIndex.value = 0
        currentCommands.value = []
      }

      reset()

      function invokeCommand() {
        let dir = player.value!.direction
        const command = currentCommands.value[commandIndex.value]
        commandIndex.value = (commandIndex.value + 1) % currentCommands.value.length
        switch (command) {
          case "forward":
            player.value!.x += dir.x
            player.value!.y += dir.y
            break
          case "right":
            if (dir == Direction.UP) player.value!.direction = Direction.RIGHT
            else if (dir == Direction.RIGHT) player.value!.direction = Direction.DOWN
            else if (dir == Direction.DOWN) player.value!.direction = Direction.LEFT
            else if (dir == Direction.LEFT) player.value!.direction = Direction.UP
            break
          case "left":
            if (dir == Direction.UP) player.value!.direction = Direction.LEFT
            else if (dir == Direction.LEFT) player.value!.direction = Direction.DOWN
            else if (dir == Direction.DOWN) player.value!.direction = Direction.RIGHT
            else if (dir == Direction.RIGHT) player.value!.direction = Direction.UP
            break
          case "red":
            if (mapToRender.value![player.value!.y][player.value!.x] !== "r") commandIndex.value = 0
            break
          case "green":
            if (mapToRender.value![player.value!.y][player.value!.x] !== "g") commandIndex.value = 0
            break
        }
        checkPlayerCell()
      }

      const defeatDialog = ref<QDialog>()
      const winDialog = ref<QDialog>()

      function checkPlayerCell() {
        const x = player.value!.x
        const y = player.value!.y
        const cell = mapToRender.value![y][x]
        if (!cell || cell == ".") {
          pause()
          defeatDialog.value!.show()
          return
        }

        const star = stars.value?.find(e => e.x == x && e.y == y)
        if (star) {
          stars.value = stars.value!.filter(e => e !== star) ?? []
          return
        }

        if (cell == "T") {
          if (stars.value!.length > 0) {
            pause()
            defeatDialog.value!.show()
            return
          }
          pause()
          winDialog.value!.show()
          return
        }
      }

      const paused = ref(true)
      let game: NodeJS.Timeout

      function play() {
        paused.value = false
        game = setInterval(() => {
          invokeCommand()
        }, 200)
      }

      function pause() {
        clearInterval(game)
        paused.value = true
      }

      function toggle() {
        if (paused.value) play()
        else stop()
      }

      function stop() {
        clearInterval(game)
        paused.value = true
        reset()
      }

      function nextLevel() {
        currentLevel.value++
        setLevel(currentLevel.value)
        reset()
      }

      type DropResult = {
        removedIndex: number,
        addedIndex: number,
        payload: any,
      }

      function onDropToHotbar(dropResult: DropResult) {
        currentCommands.value = applyDrag(currentCommands.value, dropResult)
      }

      const applyDrag = (arr: any[], dragResult: DropResult) => {
        const { removedIndex, addedIndex, payload } = dragResult
        if (removedIndex === null && addedIndex === null) return arr

        const result = [ ...arr ]
        let itemToAdd = payload

        if (removedIndex !== null) {
          itemToAdd = result.splice(removedIndex, 1)[0]
        }

        if (addedIndex !== null) {
          result.splice(addedIndex, 0, itemToAdd)
        }

        return result
      }


      function getCellColor(cell: string) {
        const c: { [key: string]: boolean } = {}
        if (cell === ".") c["bg-grey-5"] = true
        else if (cell === "r") c["bg-red-5"] = true
        else if (cell === "g") c["bg-green-5"] = true
        else if (cell === "b") c["bg-blue-5"] = true
        else c["bg-grey-4"] = true

        return c
      }

      return {
        mapToRender,
        player,
        stars,
        Direction,
        toggle,
        paused,
        stop,
        ref,
        onDropToHotbar,
        availableCommands,
        currentCommands,
        commandIndex,
        console,
        defeatDialog,
        winDialog,
        nextLevel,
        bars,
        currentLevel,
        getCellColor
      }
    }
  })
</script>

<style lang="scss">
  .cell-width {
    width: 46px;
    margin: 3px 3px;
    border-radius: 5px
  }

  .glowing {
    z-index: 0;
    box-shadow: 0px 0px 40px 10px #0ff
  }

  .glowing-star {
    z-index: 0;
    box-shadow: 0px 0px 25px 2px #ff0a
  }

  .cell {
    width: 40px;
    height: 40px;
    margin: 3px 3px;
    border-radius: 5px
  }
</style>
