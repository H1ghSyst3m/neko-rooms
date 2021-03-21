import Vue from 'vue'
import Vuex, { ActionContext } from 'vuex'

import {
  RoomEntry,
  RoomSettings,
  RoomStats,
  RoomsApi,
  Configuration,
} from '@/api/index'

import { state, State } from './state'

Vue.use(Vuex)

const api = new RoomsApi(new Configuration({
  basePath: (location.protocol + '//' + location.host + location.pathname).replace(/\/+$/, ''),
}))

export default new Vuex.Store({
  state,
  mutations: {
    ROOMS_SET(state: State, roomEntries: RoomEntry[]) {
      Vue.set(state, 'rooms', roomEntries)
    },
    ROOMS_ADD(state: State, roomEntry: RoomEntry) {
      Vue.set(state, 'rooms', [roomEntry, ...state.rooms])
    },
    ROOMS_PUT(state: State, roomEntry: RoomEntry) {
      const roomEntries = state.rooms.map((room) => {
        if (room.id == roomEntry.id) {
          return { ...room, ...roomEntry }
        } else {
          return room
        }
      })
      Vue.set(state, 'rooms', roomEntries)
    },
    ROOMS_DEL(state: State, roomId: string) {
      const roomEntries = state.rooms.filter(({ id }) => id != roomId)
      Vue.set(state, 'rooms', roomEntries)
    },
  },
  actions: {
    async ROOMS_LOAD({ commit }: ActionContext<State, State>) {
      const res = await api.roomsList()
      commit('ROOMS_SET', res.data);
    },
    async ROOMS_CREATE({ commit }: ActionContext<State, State>, roomSettings: RoomSettings): Promise<RoomEntry>  {
      const res = await api.roomCreate(roomSettings)
      commit('ROOMS_ADD', res.data);
      return res.data
    },
    async ROOMS_REMOVE({ commit }: ActionContext<State, State>, roomId: string) {
      await api.roomRemove(roomId)
      commit('ROOMS_DEL', roomId);
    },
    async ROOMS_SETTINGS(_: ActionContext<State, State>, roomId: string): Promise<RoomSettings> {
      const res = await api.roomSettings(roomId)
      return res.data
    },
    async ROOMS_STATS(_: ActionContext<State, State>, roomId: string): Promise<RoomStats> {
      const res = await api.roomStats(roomId)
      return res.data
    },
    async ROOMS_START({ commit }: ActionContext<State, State>, roomId: string) {
      await api.roomStart(roomId)
      commit('ROOMS_PUT', {
        id: roomId,
        running: true,
        status: 'Up',
      });
    },
    async ROOMS_STOP({ commit }: ActionContext<State, State>, roomId: string) {
      await api.roomStop(roomId)
      commit('ROOMS_PUT', {
        id: roomId,
        running: false,
        status: 'Exited',
      });
    },
    async ROOMS_RESTART(_: ActionContext<State, State>, roomId: string) {
      await api.roomRestart(roomId)
    },
  },
  modules: {
  }
})
