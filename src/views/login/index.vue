<template>
  <div class="login-wrap">
    <div class="login-brand">
      <h1>TestEngine</h1>
      <p>持续测试 · 测试管理 · 接口自动化</p>
    </div>
    <div class="login-form">
      <el-card shadow="never">
        <h2>{{ '账号登录' }}</h2>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-form-item prop="username" :label="'用户名'">
            <el-input v-model="form.username" placeholder="Administrator" />
          </el-form-item>
          <el-form-item prop="password" :label="'密码'">
            <el-input v-model="form.password" type="password" show-password @keyup.enter="onSubmit" />
          </el-form-item>
          <el-button type="primary" class="submit" :loading="loading" @click="onSubmit">
            {{ '登录' }}
          </el-button>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ username: 'Administrator', password: 'admin123' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function onSubmit() {
  await formRef.value!.validate()
  loading.value = true
  try {
    await userStore.login(form)
    ElMessage.success('登录成功')
    router.replace((route.query.redirect as string) || '/workstation/home')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-wrap { height: 100vh; display: flex; }
.login-brand {
  flex: 1; background: var(--accent); color: #fff;
  display: flex; flex-direction: column; justify-content: center; padding: 0 80px;
  h1 { font-size: 44px; margin-bottom: 12px; }
  p { color: rgba(255,255,255,0.75); }
}
.login-form { width: 440px; display: flex; align-items: center; justify-content: center; background: var(--surface); }
.submit { width: 100%; margin-top: 8px; }
</style>
