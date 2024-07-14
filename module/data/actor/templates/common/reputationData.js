import stat from "./stats/statData.js"


export default function reputation() {
    return stat("WITCHER.Actor.CoreStat.Rep");
  }