// src/composables/useDragSort.ts
// 列表拖拽排序 composable（原生 HTML5 Drag & Drop，把手激活模式）
import { ref } from "vue";

export function useDragSort(onReorder: (from: number, to: number) => void) {
  const dragArmed = ref(-1); // 已按住把手的行索引，仅该行可发起拖拽
  const dragIdx = ref(-1); // 当前拖动的行索引
  const overIdx = ref(-1); // 悬停目标行索引

  function onDragStart(i: number, e: DragEvent) {
    dragIdx.value = i;
    e.dataTransfer!.effectAllowed = "move";
  }
  function onDrop() {
    const from = dragIdx.value;
    const to = overIdx.value;
    if (from < 0 || to < 0 || from === to) return resetDrag();
    onReorder(from, to);
    resetDrag();
  }
  function resetDrag() {
    dragArmed.value = -1;
    dragIdx.value = -1;
    overIdx.value = -1;
  }

  return { dragArmed, dragIdx, overIdx, onDragStart, onDrop, resetDrag };
}
