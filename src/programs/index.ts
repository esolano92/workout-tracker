import type { Program } from '../types'
import { bikeBeastVol1, bikeBeastVol2 } from './bikeBeast'
import { kettlebellShred } from './kettlebellShred'

export const programs: Program[] = [kettlebellShred, bikeBeastVol1, bikeBeastVol2]

export function getProgram(id: string): Program {
  return programs.find((p) => p.id === id) ?? programs[0]
}
