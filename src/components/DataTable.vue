<template>
  <div>
    <el-table :data="data" v-loading="loading" @selection-change="(s: any[]) => $emit('selection-change', s)"
      @sort-change="$emit('sort-change', $event)">
      <el-table-column v-if="selection" type="selection" width="48" />
      <el-table-column v-for="col in columns" :key="col.prop" :prop="col.prop" :label="col.label"
        :width="col.width" :sortable="col.sortable ? 'custom' : false" :min-width="col.minWidth">
        <template #default="scope">
          <slot v-if="$slots[`col-${col.prop}`]" :name="`col-${col.prop}`" :row="scope.row" />
          <span v-else>{{ scope.row[col.prop] }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="$slots.actions" label="操作" :width="actionsWidth" fixed="right">
        <template #default="scope"><slot name="actions" :row="scope.row" /></template>
      </el-table-column>
    </el-table>
    <div class="pager" v-if="total > 0">
      <el-pagination background layout="total, sizes, prev, pager, next" :total="total"
        :page-sizes="[10, 20, 50, 100]" v-model:current-page="page.pageNum" v-model:page-size="page.pageSize"
        @current-change="(p: number) => $emit('page-change', p, page.pageSize)"
        @size-change="(s: number) => $emit('page-change', 1, s)" />
    </div>
  </div>
</template>
<script setup lang="ts">
export interface DataColumn { prop: string; label: string; width?: number; minWidth?: number; sortable?: boolean }
defineProps<{ columns: DataColumn[]; data: any[]; loading: boolean; total: number; page: { pageNum: number; pageSize: number }; selection?: boolean; actionsWidth?: number }>()
defineEmits<{ (e: 'page-change', pageNum: number, pageSize: number): void; (e: 'selection-change', rows: unknown[]): void; (e: 'sort-change', v: unknown): void }>()
</script>
<style scoped>
.pager { display: flex; justify-content: flex-end; margin-top: 12px; }
</style>
