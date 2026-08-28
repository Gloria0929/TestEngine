<template>
  <div class="org">
    <div class="section">
      <div class="section-head">
        <div class="section-title">组织</div>
        <el-button type="primary" @click="openAddOrg">创建组织</el-button>
      </div>
      <el-table :data="orgs" v-loading="orgLoading">
        <el-table-column prop="name" label="组织名称" width="200" />
        <el-table-column prop="description" label="描述" min-width="300" />
      </el-table>
    </div>

    <div class="section">
      <div class="section-head">
        <div class="section-title">项目</div>
        <el-button type="primary" @click="openAddProject">创建项目</el-button>
      </div>
      <el-table :data="projects" v-loading="projectLoading">
        <el-table-column prop="name" label="项目名称" width="200" />
        <el-table-column prop="description" label="描述" min-width="240" />
        <el-table-column prop="caseCount" label="用例数" width="100" />
      </el-table>
    </div>

    <el-dialog v-model="orgDialogVisible" title="创建组织" width="480px">
      <el-form label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="orgForm.name" placeholder="组织名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="orgForm.description" placeholder="组织描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="orgDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onAddOrg">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="projectDialogVisible" title="创建项目" width="480px">
      <el-form label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="projectForm.name" placeholder="项目名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="projectForm.description" placeholder="项目描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="projectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onAddProject">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchSysOrgs, createSysOrg } from '@/api/setting'
import { fetchProjects, createProject } from '@/api/project'
import type { Organization, Project } from '@/types/models'

const ORG_ID = '100001'

const orgs = ref<Organization[]>([])
const projects = ref<Project[]>([])
const orgLoading = ref(false)
const projectLoading = ref(false)
const orgDialogVisible = ref(false)
const projectDialogVisible = ref(false)
const orgForm = reactive({ name: '', description: '' })
const projectForm = reactive({ name: '', description: '' })

function openAddOrg() {
  orgForm.name = ''
  orgForm.description = ''
  orgDialogVisible.value = true
}
async function onAddOrg() {
  await createSysOrg({ name: orgForm.name, description: orgForm.description })
  ElMessage.success('已创建')
  orgDialogVisible.value = false
  loadOrgs()
}
function openAddProject() {
  projectForm.name = ''
  projectForm.description = ''
  projectDialogVisible.value = true
}
async function onAddProject() {
  await createProject({ name: projectForm.name, description: projectForm.description })
  ElMessage.success('已创建')
  projectDialogVisible.value = false
  loadProjects()
}
async function loadOrgs() {
  orgLoading.value = true
  orgs.value = await fetchSysOrgs()
  orgLoading.value = false
}
async function loadProjects() {
  projectLoading.value = true
  projects.value = await fetchProjects({ orgId: ORG_ID })
  projectLoading.value = false
}
onMounted(() => {
  loadOrgs()
  loadProjects()
})
</script>
<style scoped>
.section { margin-bottom: 24px; }
.section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.section-title { font-weight: 600; }
</style>
