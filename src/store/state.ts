import DefaultCharacter from "./DefaultCharacter";
import { State } from "../types";

let state: State  = {
  notifications: [],
  savedBuilds: [],
  shareStatus: null,
  sharedBuild: null,
  character: DefaultCharacter(),
  stages: [],
  currentStage: null
}

export default state;
