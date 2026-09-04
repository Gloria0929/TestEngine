// src/composables/useFolders.ts — 列表页目录过滤 + 目录数据加载
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { fetchFolders } from "@/api/collections";
import type { ModuleFolder } from "@/types/models";

export function useFolders(module: string) {
  const route = useRoute();
  const folders = ref<ModuleFolder[]>([]);

  async function loadFolders() {
    try {
      folders.value = (await fetchFolders(module)) as any;
    } catch {
      folders.value = [];
    }
  }

  /** 当前目录过滤（来自侧边目录点击，'' = 全部，'none' = 未分类） */
  const folderFilter = computed(() => (route.query.folderId ? String(route.query.folderId) : ""));

  return { folders, loadFolders, folderFilter };
}
