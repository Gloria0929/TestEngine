// src/stores/collections.ts — 目录变更通知：列表页移动/增删记录后，侧边目录据此刷新
import { defineStore } from "pinia";

export const useCollectionsStore = defineStore("collections", {
  state: () => ({ refreshTick: 0 }),
  actions: {
    notifyChange() {
      this.refreshTick++;
    },
  },
});
