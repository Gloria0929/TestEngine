# TestEngine API 文档（Java 后端版）

> 依据前端源码整理：接口封装位于 [src/api](file:///Users/fuhao/Downloads/TestEngine/src/api)，类型定义位于 [src/types/models.ts](file:///Users/fuhao/Downloads/TestEngine/src/types/models.ts)、[src/types/index.ts](file:///Users/fuhao/Downloads/TestEngine/src/types/index.ts)。
> 本文按 **Spring Boot** 风格描述后端实现：每个模块对应一个 `@RestController`，请求/响应体对应 Java DTO。字段名与前端保持一致（驼峰），无需额外转换。

---

## 目录

1. [通用约定](#1-通用约定)
2. [工作台 WorkstationController](#2-工作台-workstationcontroller)
3. [项目协作 ProjectController](#3-项目协作-projectcontroller)
4. [测试用例 TestCaseController](#4-测试用例-testcasecontroller)
5. [测试计划 TestPlanController](#5-测试计划-testplancontroller)
6. [接口测试 ApiTestController](#6-接口测试-apitestcontroller)
7. [缺陷管理 BugController](#7-缺陷管理-bugcontroller)
8. [页面与 API 对照表](#8-页面与-api-对照表)

---

## 1. 通用约定

### 1.1 请求基础

| 项 | 说明 |
| --- | --- |
| Content-Type | `application/json`（附件上传除外，使用 `multipart/form-data`） |
| 前端 baseURL | `import.meta.env.VITE_API_BASE_URL`，建议后端统一前缀 `/api` |
| 超时 | 前端 15000ms |
| 认证头 | 请求拦截器自动附加 `Authorization: Bearer {token}`；后端返回 `code=401` 时前端清除本地登录态 |

### 1.2 统一响应包装 `Result<T>`

所有接口返回统一包装（对应前端的 `ApiResult<T>`）：

```java
public class Result<T> {
    private int code;        // 0 成功；非 0 失败；401 未认证
    private String message;  // 提示信息，成功时为 "ok"
    private T data;          // 业务数据，下文各接口"返回参数"均指 data 的结构

    public static <T> Result<T> ok(T data)  { ... }
    public static <T> Result<T> fail(int code, String message) { ... }
}
```

```json
{ "code": 0, "message": "ok", "data": T }
```

### 1.3 分页

**请求 `PageQuery`**（各分页接口的 query 参数基类，前端已按此结构传参）：

```java
public class PageQuery {
    private Integer pageNum;   // 必填，从 1 开始
    private Integer pageSize;  // 必填，10 / 20 / 50
    private String keyword;    // 可选，关键词
    private String sortField;  // 可选，排序字段
    private String sortOrder;  // 可选，"asc" | "desc"
}
```

**返回 `PageResult<T>`**：

```java
public class PageResult<T> {
    private List<T> list;      // 当前页数据
    private Long total;        // 总条数
    private Integer pageNum;   // 当前页码
    private Integer pageSize;  // 每页条数
}
```

> 类型映射约定：前端 `number` → `Integer`/`Long`；`boolean` → `Boolean`；`string[]` → `List<String>`；时间字段（如 `2026-08-26 10:00`）统一用 `String` 传输（如需 `LocalDateTime`，请加 `@JsonFormat(pattern = "yyyy-MM-dd HH:mm")` 并保证输出格式一致）。

---

## 2. 工作台 WorkstationController

前端封装：[api/workstation.ts](file:///Users/fuhao/Downloads/TestEngine/src/api/workstation.ts)

```java
@RestController
@RequestMapping("/api/workstation")
public class WorkstationController {

    /** 2.1 资产总览（工作台首页统计卡片） */
    @GetMapping("/overview")
    public Result<OverviewVO> overview(@RequestParam String projectId,
                                       @RequestParam String range) { ... }

    /** 2.2 趋势数据（工作台首页 ECharts 折线图） */
    @GetMapping("/trend")
    public Result<List<TrendPointVO>> trend(@RequestParam String projectId,
                                            @RequestParam String range) { ... }
}
```

### 2.1 资产总览 `GET /api/workstation/overview`

**请求参数（query）**：

| 字段 | Java 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| projectId | String | 是 | 项目 ID |
| range | String | 是 | 时间范围：`3d` / `7d` |

**返回 `OverviewVO`**：

| 字段 | Java 类型 | 说明 |
| --- | --- | --- |
| caseCount | Integer | 功能用例数 |
| reviewCount | Integer | 用例评审数 |
| apiCount | Integer | 接口 API 数 |
| scenarioCount | Integer | 场景数 |

### 2.2 趋势数据 `GET /api/workstation/trend`

**请求参数（query）**：同 2.1（projectId、range）。

**返回 `List<TrendPointVO>`**：

| 字段 | Java 类型 | 说明 |
| --- | --- | --- |
| date | String | 日期（如 `08-27`） |
| cases | Integer | 用例数 |
| apis | Integer | 接口数 |

---

## 3. 项目协作 ProjectController

前端封装：[api/project.ts](file:///Users/fuhao/Downloads/TestEngine/src/api/project.ts)

```java
@RestController
@RequestMapping("/api/project")
public class ProjectController {

    /** 3.1 操作日志分页（操作日志页） */
    @GetMapping("/logs")
    public Result<PageResult<OperationLogVO>> logs(OperationLogQuery query) { ... }
}
```

### 3.1 操作日志分页 `GET /api/project/logs`

**请求参数（query，`OperationLogQuery extends PageQuery`）**：

| 字段 | Java 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| pageNum / pageSize | Integer | 是 | 分页 |
| scope | String | 否 | 操作范围 |
| action | String | 否 | 操作类型 |
| user | String | 否 | 操作人 |
| object | String | 否 | 操作对象/名称（模糊匹配） |

**返回 `PageResult<OperationLogVO>`**，`OperationLogVO`：

| 字段 | Java 类型 | 说明 |
| --- | --- | --- |
| id | String | 日志 ID |
| scope | String | 操作范围 |
| object | String | 操作对象 |
| action | String | 操作类型（新增/修改/删除/执行等） |
| user | String | 操作人 |
| time | String | 操作时间 |

---

## 4. 测试用例 TestCaseController

前端封装：[api/testCase.ts](file:///Users/fuhao/Downloads/TestEngine/src/api/testCase.ts)

```java
@RestController
@RequestMapping("/api/test-case")
public class TestCaseController {

    /** 4.1 模块树（用例列表/编辑弹窗的所属模块选择） */
    @GetMapping("/modules")
    public Result<List<ModuleNodeVO>> modules(@RequestParam String projectId) { ... }

    /** 4.2 用例分页列表 */
    @GetMapping("/list")
    public Result<PageResult<TestCaseVO>> list(TestCasePageQuery query) { ... }

    /** 4.3 用例详情 */
    @GetMapping("/{id}")
    public Result<TestCaseVO> detail(@PathVariable String id) { ... }

    /** 4.4 新建用例（列表"新建用例"弹窗、Excel 导入逐条创建） */
    @PostMapping
    public Result<TestCaseVO> create(@RequestBody TestCaseDTO dto) { ... }

    /** 4.5 更新用例（列表"编辑"、详情页"保存基本信息/保存步骤"） */
    @PutMapping("/{id}")
    public Result<TestCaseVO> update(@PathVariable String id, @RequestBody TestCaseDTO dto) { ... }

    /** 4.6 删除用例（软删除，进入回收站） */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { ... }

    /** 4.7 回收站列表 */
    @GetMapping("/recycle")
    public Result<List<TestCaseVO>> recycleList() { ... }

    /** 4.8 恢复用例（回收站"恢复"） */
    @PostMapping("/recycle/{id}/restore")
    public Result<Void> restore(@PathVariable String id) { ... }

    /** 4.9 彻底删除用例（回收站"彻底删除"，不可恢复） */
    @DeleteMapping("/recycle/{id}")
    public Result<Void> purge(@PathVariable String id) { ... }

    /** 4.10 评审列表 */
    @GetMapping("/reviews")
    public Result<List<ReviewVO>> reviews() { ... }

    /** 4.11 新建评审（"新建评审"弹窗） */
    @PostMapping("/reviews")
    public Result<ReviewVO> createReview(@RequestBody ReviewDTO dto) { ... }

    /** 4.12 评审详情（评审弹窗，逐条评审用例） */
    @GetMapping("/reviews/{id}")
    public Result<ReviewDetailVO> reviewDetail(@PathVariable String id) { ... }

    /** 4.13 提交评审结果（评审弹窗"提交评审"） */
    @PostMapping("/reviews/{id}/result")
    public Result<ReviewVO> submitReviewResult(@PathVariable String id,
                                               @RequestBody ReviewResultDTO dto) { ... }
}
```

### 4.1 模块树

**请求参数（query）**：`projectId: String`（必填）。

**返回 `List<ModuleNodeVO>`**（树形，递归）：

| 字段 | Java 类型 | 说明 |
| --- | --- | --- |
| id | String | 模块 ID |
| name | String | 模块名称 |
| children | List\<ModuleNodeVO\> | 子模块（可为空列表） |

### 4.2 用例分页列表

**请求参数（query）**：`PageQuery`（pageNum、pageSize、keyword 等）。

**返回 `PageResult<TestCaseVO>`**，`TestCaseVO`：

| 字段 | Java 类型 | 说明 |
| --- | --- | --- |
| id | String | 用例 ID |
| projectId | String | 项目 ID |
| moduleId | String | 所属模块 ID |
| name | String | 用例名称 |
| testPoint | String | 测试点 |
| precondition | String | 前置条件 |
| steps | List\<CaseStepVO\> | 步骤（见下） |
| level | String | 等级：`P0` / `P1` / `P2` / `P3` |
| status | String | 状态：`DRAFT`（草稿）/ `REVIEW`（待评审）/ `READY`（就绪） |
| executor | String | 执行人 |
| tags | List\<String\> | 标签 |
| createUser | String | 创建人 |
| updateTime | String | 更新时间 |
| follow | Boolean | 是否关注 |
| remark | String | 备注（可空） |
| attachments | List\<String\> | 附件（可空） |
| purpose | String | 用例目的（可空） |
| preCaseIds / postCaseIds / relatedCaseIds / bugIds | List\<String\> | 前置/后置/关联用例、关联缺陷（可空） |

`CaseStepVO`：

| 字段 | Java 类型 | 说明 |
| --- | --- | --- |
| id | String | 步骤 ID |
| description | String | 步骤描述 |
| expected | String | 预期结果 |

### 4.3 用例详情

**路径参数**：`id`。**返回**：`TestCaseVO`（结构同 4.2）。

### 4.4 新建用例

**请求参数（body，`TestCaseDTO`）**：name、moduleId、level、precondition、steps、tags 等（`TestCaseVO` 的子集，id 等服务端生成）。

**返回参数**：新建的 `TestCaseVO`。

### 4.5 更新用例

**请求参数**：路径 `id`；body `TestCaseDTO`。**返回**：更新后的 `TestCaseVO`。

### 4.6 删除用例

软删除，进入回收站。**路径参数**：`id`。**返回**：`Result<Void>`（data 为 null，下同）。

### 4.7 回收站列表

无请求参数。**返回**：`List<TestCaseVO>`。

### 4.8 / 4.9 恢复 / 彻底删除

**路径参数**：`id`。**返回**：`Result<Void>`。

### 4.10 评审列表

无请求参数。**返回 `List<ReviewVO>`**：

| 字段 | Java 类型 | 说明 |
| --- | --- | --- |
| id | String | 评审 ID |
| name | String | 评审名称 |
| reviewers | List\<String\> | 评审人列表 |
| status | String | `PENDING`（待评审）/ `PASSED`（通过）/ `REJECTED`（驳回） |
| caseCount | Integer | 关联用例数 |
| caseIds | List\<String\> | 关联用例 ID |
| startTime / endTime | String | 起止时间 |

### 4.11 新建评审

**请求参数（body，`ReviewDTO`）**：name、reviewers、caseIds、startTime、endTime。

**返回参数**：新建的 `ReviewVO`。

### 4.12 评审详情

**路径参数**：`id`。**返回 `ReviewDetailVO`** = `ReviewVO` 字段 + `cases: List<TestCaseVO>`（关联用例完整信息）。

### 4.13 提交评审结果

**请求参数**：路径 `id`；body `ReviewResultDTO`：

```java
public class ReviewResultDTO {
    private List<ReviewCaseResult> results;
}
public class ReviewCaseResult {
    private String caseId;    // 必填，用例 ID
    private Boolean passed;   // 必填，通过/不通过
    private String comment;   // 可选，评审意见
}
```

**返回参数**：更新后的 `ReviewVO`（后端根据 results 计算整体状态：全部通过 → `PASSED`，任一不通过 → `REJECTED`）。

---

## 5. 测试计划 TestPlanController

前端封装：[api/testPlan.ts](file:///Users/fuhao/Downloads/TestEngine/src/api/testPlan.ts)

```java
@RestController
@RequestMapping("/api/test-plan")
public class TestPlanController {

    /** 5.1 计划分页列表 */
    @GetMapping("/list")
    public Result<PageResult<TestPlanVO>> list(TestPlanPageQuery query) { ... }

    /** 5.2 计划详情（计划执行详情页头部） */
    @GetMapping("/{id}")
    public Result<TestPlanVO> detail(@PathVariable String id) { ... }

    /** 5.3 新建计划（"新建计划"弹窗） */
    @PostMapping
    public Result<TestPlanVO> create(@RequestBody TestPlanDTO dto) { ... }

    /** 5.4 更新计划（列表/执行详情页"编辑"） */
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable String id, @RequestBody TestPlanDTO dto) { ... }

    /** 5.5 删除计划（"更多 → 删除"，入回收站） */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { ... }

    /** 5.6 复制计划（"更多 → 复制"） */
    @PostMapping("/{id}/copy")
    public Result<TestPlanVO> copy(@PathVariable String id) { ... }

    /** 5.7 计划关联用例列表（执行详情页"功能用例" Tab） */
    @GetMapping("/{planId}/cases")
    public Result<List<PlanCaseVO>> planCases(@PathVariable String planId,
                                              @RequestParam(required = false) String moduleId,
                                              @RequestParam(required = false) String testPoint,
                                              @RequestParam(required = false) String keyword) { ... }

    /** 5.8 提交用例执行结果（用例执行页"提交结果"） */
    @PostMapping("/{planId}/results")
    public Result<Void> submitResult(@PathVariable String planId,
                                     @RequestBody List<PlanCaseResultDTO> results) { ... }

    /** 5.9 用例执行历史（用例执行页"执行历史" Tab） */
    @GetMapping("/{planId}/cases/{caseId}/history")
    public Result<List<CaseExecuteHistoryVO>> caseHistory(@PathVariable String planId,
                                                          @PathVariable String caseId) { ... }

    /** 5.10 计划执行历史（执行详情页"执行历史" Tab） */
    @GetMapping("/{planId}/history")
    public Result<List<CaseExecuteHistoryVO>> planHistory(@PathVariable String planId) { ... }

    /** 5.11 计划关联缺陷（执行详情页/用例执行页"缺陷列表" Tab） */
    @GetMapping("/{planId}/bugs")
    public Result<List<BugVO>> planBugs(@PathVariable String planId) { ... }

    /** 5.12 计划报告（报告页） */
    @GetMapping("/{planId}/report")
    public Result<PlanReportVO> report(@PathVariable String planId) { ... }

    /** 5.13 导出报告（报告页"导出 HTML / 导出 Excel"） */
    @PostMapping("/{planId}/report/export")
    public Result<ExportVO> exportReport(@PathVariable String planId) { ... }

    /** 5.14 分享报告（报告页"复制分享链接"） */
    @PostMapping("/{planId}/report/share")
    public Result<ShareVO> shareReport(@PathVariable String planId) { ... }
}

@RestController
@RequestMapping("/api/test-report")
public class TestReportController {

    /** 5.15 报告汇总列表（"测试报告"视图） */
    @GetMapping("/list")
    public Result<PageResult<TestReportRowVO>> list(PageQuery query) { ... }

    /** 5.16 删除报告（报告行内"删除"） */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { ... }
}
```

### 5.1 计划分页列表

**请求参数（query）**：`PageQuery`（pageNum、pageSize、keyword、status、模块等）。

**返回 `PageResult<TestPlanVO>`**，`TestPlanVO`：

| 字段 | Java 类型 | 说明 |
| --- | --- | --- |
| id | String | 计划 ID |
| projectId | String | 项目 ID |
| name | String | 计划名称 |
| status | String | `DRAFT` / `RUNNING` / `DONE` |
| owner | String | 负责人 |
| startTime / endTime | String | 计划周期 |
| progress | Integer | 执行进度（%） |
| passRate | Integer | 通过率（%） |
| group | String | 所属模块/分组 |

### 5.2 ~ 5.6 计划详情 / 新建 / 更新 / 删除 / 复制

- 5.2 详情：路径 `id`，返回 `TestPlanVO`；
- 5.3 新建：body `TestPlanDTO`（`TestPlanVO` 子集），返回新建的 `TestPlanVO`；
- 5.4 更新：路径 `id` + body `TestPlanDTO`，返回 `Result<Void>`；
- 5.5 删除：路径 `id`，返回 `Result<Void>`；
- 5.6 复制：路径 `id`，返回复制生成的 `TestPlanVO`。

### 5.7 计划关联用例列表

**请求参数**：路径 `planId`；query（可选）`moduleId`、`testPoint`、`keyword`。

**返回 `List<PlanCaseVO>`** = `TestCaseVO` 全部字段 + `result: String`（执行结果：`PASS` / `FAIL` / `BLOCK` / `SKIP`，未执行为 null）。

### 5.8 提交用例执行结果

**请求参数**：路径 `planId`；body `List<PlanCaseResultDTO>`：

| 字段 | Java 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| caseId | String | 是 | 用例 ID |
| result | String | 是 | `PASS` / `FAIL` / `BLOCK` / `SKIP` |
| actual | String | 是 | 实际结果 |
| stepResults | List\<StepResultDTO\> | 否 | 逐步骤结果 |

`StepResultDTO`：

| 字段 | Java 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| stepId | String | 是 | 步骤 ID |
| result | String | 否 | 步骤结果（`PASS`/`FAIL`/`BLOCK`/`SKIP` 或空） |
| actual | String | 否 | 步骤实际结果 |

**返回参数**：`Result<Void>`。后端需同步刷新计划的进度/通过率并写入执行历史。

### 5.9 / 5.10 执行历史

**路径参数**：5.9 为 `planId` + `caseId`；5.10 仅 `planId`。

**返回 `List<CaseExecuteHistoryVO>`**：

| 字段 | Java 类型 | 说明 |
| --- | --- | --- |
| id | String | 记录 ID |
| planId / caseId | String | 计划/用例 ID |
| result | String | 执行结果（PASS/FAIL/BLOCK/SKIP） |
| actual | String | 实际结果 |
| executor | String | 执行人 |
| executeTime | String | 执行时间 |

### 5.11 计划关联缺陷

**路径参数**：`planId`。**返回**：`List<BugVO>`（结构见 7.1）。

### 5.12 计划报告

**路径参数**：`planId`。**返回 `PlanReportVO`**：

| 字段 | Java 类型 | 说明 |
| --- | --- | --- |
| id / planId | String | 报告/计划 ID |
| name | String | 报告名称 |
| progress | Integer | 执行进度（%） |
| passRate | Integer | 通过率（%） |
| total / passed / failed / blocked / skipped | Integer | 总数与各结果数量 |
| failDistribution | List\<ModuleCountVO\> | 失败按模块分布：`{ module: String, count: Integer }` |
| results | List\<ReportItemVO\> | 明细：`{ caseId, caseName, testPoint, level, type（manual/auto）, result }` |
| shareUrl | String | 分享链接 |
| expireAt | String | 分享过期时间 |

### 5.13 / 5.14 导出 / 分享报告

- 5.13 导出：路径 `planId`，**返回 `ExportVO`**：`{ url: String }`（导出文件地址）；
- 5.14 分享：路径 `planId`，**返回 `ShareVO`**：`{ shareUrl: String, expireAt: String }`。

### 5.15 / 5.16 报告汇总列表 / 删除报告

- 5.15 列表：query `PageQuery`，返回 `PageResult<TestReportRowVO>`（报告行：名称、类型、计划名称、执行结果、通过率、触发方式、创建人、创建时间等）；
- 5.16 删除：路径 `id`，返回 `Result<Void>`。

### 5.17 上传用例执行附件 `POST /api/upload`

页面：用例逐步执行页（[caseExecute/index.vue](file:///Users/fuhao/Downloads/TestEngine/src/views/testPlan/caseExecute/index.vue)）的附件上传组件（`el-upload` 直接以 `action="/api/upload"` 提交，不走 api 封装层）。

```java
@PostMapping(value = "/api/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public Result<ExportVO> upload(@RequestParam("file") MultipartFile file) { ... }
```

**请求参数**：`multipart/form-data`，字段 `file`（MultipartFile）。

**返回参数**：`{ url: String }`（附件访问地址）。

---

## 6. 接口测试 ApiTestController

前端封装：[api/apiTest.ts](file:///Users/fuhao/Downloads/TestEngine/src/api/apiTest.ts)

```java
@RestController
@RequestMapping("/api/api-test")
public class ApiTestController {

    /** 6.1 调试请求配置列表（调试页回显已保存的请求） */
    @GetMapping("/debug")
    public Result<List<DebugRequestVO>> debugList() { ... }

    /** 6.2 发送请求（调试页"发送"） */
    @PostMapping("/execute")
    public Result<ExecuteResponseVO> execute(@RequestBody DebugRequestDTO dto) { ... }

    /** 6.3 接口定义分页（接口定义列表页） */
    @GetMapping("/definitions")
    public Result<DefinitionPageVO> definitionPage(DefinitionPageQuery query) { ... }

    /** 6.4 新建接口定义（"新建接口"弹窗） */
    @PostMapping("/definitions")
    public Result<ApiDefinitionVO> createDefinition(@RequestBody ApiDefinitionDTO dto) { ... }

    /** 6.5 更新接口定义（行内"编辑"） */
    @PutMapping("/definitions/{id}")
    public Result<ApiDefinitionVO> updateDefinition(@PathVariable String id,
                                                    @RequestBody ApiDefinitionDTO dto) { ... }

    /** 6.6 删除接口定义（行内"删除"） */
    @DeleteMapping("/definitions/{id}")
    public Result<Void> deleteDefinition(@PathVariable String id) { ... }

    /** 6.7 导入接口定义（"导入"弹窗，支持 Swagger JSON / Postman / HAR 文本） */
    @PostMapping("/import-definition")
    public Result<ImportResultVO> importDefinition(@RequestBody ImportDefinitionDTO dto) { ... }

    /** 6.8 场景分页列表（场景管理列表页） */
    @GetMapping("/scenarios")
    public Result<ScenarioPageVO> scenarioPage(ScenarioPageQuery query) { ... }

    /** 6.9 新建场景（"新建场景"弹窗） */
    @PostMapping("/scenarios")
    public Result<ScenarioVO> createScenario(@RequestBody ScenarioDTO dto) { ... }

    /** 6.10 场景详情（场景编辑页加载） */
    @GetMapping("/scenarios/{id}")
    public Result<ScenarioVO> scenarioDetail(@PathVariable String id) { ... }

    /** 6.11 更新场景（场景编辑页"保存"，步骤排序/参数配置） */
    @PutMapping("/scenarios/{id}")
    public Result<ScenarioVO> updateScenario(@PathVariable String id,
                                             @RequestBody ScenarioDTO dto) { ... }

    /** 6.12 执行场景（场景管理行内"执行"） */
    @PostMapping("/scenarios/{id}/execute")
    public Result<Map<String, Object>> executeScenario(@PathVariable String id) { ... }

    /** 6.13 删除场景（行内"删除"） */
    @DeleteMapping("/scenarios/{id}")
    public Result<Void> deleteScenario(@PathVariable String id) { ... }

    /** 6.14 接口报告分页（接口报告列表页） */
    @GetMapping("/reports")
    public Result<ReportPageVO> reportPage(ReportPageQuery query) { ... }

    /** 6.15 报告详情（接口报告"查看详情"） */
    @GetMapping("/reports/{id}")
    public Result<ApiReportVO> reportDetail(@PathVariable String id) { ... }

    /** 6.16 删除报告（行内"删除"） */
    @DeleteMapping("/reports/{id}")
    public Result<Void> deleteReport(@PathVariable String id) { ... }

    // ===== 调试收藏夹（文件夹 + 已保存接口） =====

    /** 6.17 收藏夹列表（调试页左侧栏，文件夹含已保存接口） */
    @GetMapping("/debug-collections")
    public Result<List<DebugFolderVO>> collectionList() { ... }

    /** 6.18 新建文件夹 */
    @PostMapping("/debug-collections")
    public Result<DebugFolderVO> createFolder(@RequestBody FolderNameDTO dto) { ... }

    /** 6.19 重命名文件夹 */
    @PutMapping("/debug-collections/{id}")
    public Result<Void> renameFolder(@PathVariable String id, @RequestBody FolderNameDTO dto) { ... }

    /** 6.20 删除文件夹（其中的已保存接口一并删除） */
    @DeleteMapping("/debug-collections/{id}")
    public Result<Void> deleteFolder(@PathVariable String id) { ... }

    /** 6.21 保存接口到文件夹（body 为完整 DebugRequestDTO，服务端生成 id） */
    @PostMapping("/debug-collections/{id}/items")
    public Result<DebugRequestVO> saveItem(@PathVariable String id,
                                           @RequestBody DebugRequestDTO dto) { ... }

    /** 6.22 重命名文件夹内接口 */
    @PutMapping("/debug-collections/{folderId}/items/{itemId}")
    public Result<Void> renameItem(@PathVariable String folderId,
                                   @PathVariable String itemId,
                                   @RequestBody FolderNameDTO dto) { ... }

    /** 6.23 删除文件夹内接口 */
    @DeleteMapping("/debug-collections/{folderId}/items/{itemId}")
    public Result<Void> deleteItem(@PathVariable String folderId,
                                   @PathVariable String itemId) { ... }
}
```

### 6.1 调试请求配置列表

无请求参数。**返回 `List<DebugRequestVO>`**：

| 字段 | Java 类型 | 说明 |
| --- | --- | --- |
| id | String | 配置 ID |
| name | String | 名称 |
| method | String | GET/POST/PUT/DELETE/PATCH/OPTIONS/HEAD/CONNECT |
| url | String | 请求地址 |
| protocol | String | HTTP / TCP / SQL / DUBBO |
| headers | List\<KeyValueVO\> | 请求头：`{ key, value, enabled }` |
| query | List\<KeyValueVO\> | 查询参数 |
| bodyType | String | `none` / `form-data` / `x-www-form-urlencoded` / `raw` |
| body | String | raw 请求体 |
| bodyParams | List\<KeyValueVO\> | 键值对请求体 |
| authType | String | `none` / `basic` / `bearer` / `cookie` |
| auth | Map\<String, String\> | 认证参数 |

`KeyValueVO`：`{ key: String, value: String, enabled: Boolean }`。

### 6.2 发送请求（执行调试）

**请求参数（body）**：完整 `DebugRequestDTO`（结构同 6.1）。

**返回 `ExecuteResponseVO`**：

| 字段 | Java 类型 | 说明 |
| --- | --- | --- |
| status | Integer | HTTP 状态码 |
| time | Long | 耗时（ms） |
| headers | Map\<String, String\> | 响应头 |
| body | String | 响应体 |
| console | List\<String\> | 控制台输出 |

> 后端职责：按 bodyType 组装请求（raw / form-data / x-www-form-urlencoded），按 authType 附加认证头，代理发送目标 URL 并记录耗时。

### 6.3 接口定义分页

**请求参数（query，`DefinitionPageQuery extends PageQuery`）**：

| 字段 | Java 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| pageNum / pageSize | Integer | 是 | 分页 |
| keyword | String | 否 | 名称/路径关键词 |
| method | String | 否 | 请求方法筛选 |
| status | String | 否 | 状态筛选（未规划/进行中/已完成/已归档） |

**返回**：`{ list: List<ApiDefinitionVO>, total: Long }`，`ApiDefinitionVO`：

| 字段 | Java 类型 | 说明 |
| --- | --- | --- |
| id | String | 接口 ID |
| name | String | 接口名称 |
| method | String | 请求方法（GET/POST/...） |
| path | String | 请求路径 |
| protocol | String | HTTP / HTTPS |
| status | String | 未规划 / 进行中 / 已完成 / 已归档 |
| responsible | String | 责任人 |
| caseCount | Integer | 关联用例数 |
| tags | List\<String\> | 标签 |
| updateTime | String | 更新时间 |
| desc | String | 描述 |

### 6.4 / 6.5 / 6.6 新建 / 更新 / 删除接口定义

body 为 `ApiDefinitionDTO`（`ApiDefinitionVO` 子集），返回同类型对象；删除返回 `Result<Void>`。

### 6.7 导入接口定义

**请求参数（body，`ImportDefinitionDTO`）**：

| 字段 | Java 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| text | String | 是 | 粘贴的 Swagger/Postman/HAR JSON 文本 |

**返回 `ImportResultVO`**：`{ count: Integer }`（成功导入的接口数量）。后端需兼容三种格式的解析。

### 6.8 场景分页列表

**请求参数（query，`ScenarioPageQuery extends PageQuery`）**：pageNum、pageSize（必填），keyword、status（可选）。

**返回**：`{ list: List<ScenarioVO>, total: Long }`，`ScenarioVO`：

| 字段 | Java 类型 | 说明 |
| --- | --- | --- |
| id | String | 场景 ID |
| name | String | 场景名称 |
| apiCount | Integer | 包含接口（步骤）数 |
| status | String | 未执行 / 执行中 / 通过 / 失败 |
| responsible | String | 责任人 |
| creator | String | 创建人 |
| createTime / updateTime | String | 创建/更新时间 |
| level | String | 等级 P0-P3（可空） |
| tags | List\<String\> | 标签（可空） |
| desc | String | 描述（可空） |
| steps | List\<ScenarioStepVO\> | 步骤（可空）：`{ id, name, expected? }` |

### 6.9 ~ 6.13 场景 CRUD 与执行

- 6.9 新建：body `ScenarioDTO`，返回新建 `ScenarioVO`；
- 6.10 详情：路径 `id`，返回 `ScenarioVO`（不存在时 data 为 null）；
- 6.11 更新：路径 `id` + body `ScenarioDTO`，返回更新后 `ScenarioVO`；
- 6.12 执行：路径 `id`，返回 `Map<String, Object>`（执行结果对象，含步骤执行明细）；
- 6.13 删除：路径 `id`，返回 `Result<Void>`。

### 6.14 接口报告分页

**请求参数（query，`ReportPageQuery extends PageQuery`）**：pageNum、pageSize（必填），keyword、type（可选，接口/场景）。

**返回**：`{ list: List<ApiReportVO>, total: Long }`，`ApiReportVO`：

| 字段 | Java 类型 | 说明 |
| --- | --- | --- |
| id | String | 报告 ID |
| name | String | 报告名称 |
| type | String | 类型（接口/场景） |
| result | String | 执行结果 |
| passRate | Integer | 通过率（%） |
| total / success / fail | Integer | 总数/成功数/失败数 |
| executor | String | 执行人 |
| createTime | String | 创建时间 |
| steps | List\<ReportStepVO\> | 步骤明细（可空） |

`ReportStepVO`：`{ name: String, method: String, path: String, result: String, time: Long }`。

### 6.15 / 6.16 报告详情 / 删除报告

- 6.15 详情：路径 `id`，返回 `ApiReportVO`（含 steps）；
- 6.16 删除：路径 `id`，返回 `Result<Void>`。

### 6.17 ~ 6.23 调试收藏夹

**`DebugFolderVO`**（6.17 返回 `List<DebugFolderVO>`，6.18 返回单个）：

| 字段 | Java 类型 | 说明 |
| --- | --- | --- |
| id | String | 文件夹 ID |
| name | String | 文件夹名称 |
| items | List\<DebugRequestVO\> | 文件夹内已保存的调试请求（结构同 6.1） |

**`FolderNameDTO`**（6.18/6.19/6.22 请求 body）：`{ name: String }`。

| 编号 | 路径与方法 | 说明 |
| --- | --- | --- |
| 6.17 | `GET /api/api-test/debug-collections` | 返回全部文件夹及其中接口 |
| 6.18 | `POST /api/api-test/debug-collections` | 新建文件夹，返回新建的 `DebugFolderVO` |
| 6.19 | `PUT /api/api-test/debug-collections/{id}` | 重命名文件夹 |
| 6.20 | `DELETE /api/api-test/debug-collections/{id}` | 删除文件夹（级联删除其中接口） |
| 6.21 | `POST /api/api-test/debug-collections/{id}/items` | 保存接口到文件夹，body 为完整 `DebugRequestDTO`，返回生成 id 后的 `DebugRequestVO` |
| 6.22 | `PUT /api/api-test/debug-collections/{folderId}/items/{itemId}` | 重命名文件夹内接口 |
| 6.23 | `DELETE /api/api-test/debug-collections/{folderId}/items/{itemId}` | 删除文件夹内接口 |

> 调试记录（历史）由前端 localStorage 持久化，不走后端接口。

---

## 7. 缺陷管理 BugController

前端封装：[api/bug.ts](file:///Users/fuhao/Downloads/TestEngine/src/api/bug.ts)

```java
@RestController
@RequestMapping("/api/bug")
public class BugController {

    /** 7.1 缺陷分页列表 */
    @GetMapping("/list")
    public Result<PageResult<BugVO>> list(BugPageQuery query) { ... }

    /** 7.2 新建缺陷（"新建缺陷"、用例执行页"添加缺陷"、报告页"转缺陷"） */
    @PostMapping
    public Result<BugVO> create(@RequestBody BugDTO dto) { ... }

    /** 7.3 更新缺陷（行内"编辑"） */
    @PutMapping("/{id}")
    public Result<BugVO> update(@PathVariable String id, @RequestBody BugDTO dto) { ... }

    /** 7.4 删除缺陷（行内"删除"） */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { ... }
}
```

### 7.1 缺陷分页列表

**请求参数（query）**：`PageQuery`（pageNum、pageSize、keyword、status、优先级等）。

**返回 `PageResult<BugVO>`**，`BugVO`：

| 字段 | Java 类型 | 说明 |
| --- | --- | --- |
| id | String | 缺陷 ID |
| projectId | String | 项目 ID |
| planId | String | 关联测试计划 ID（可空） |
| title | String | 缺陷名称 |
| severity | String | 严重级别：BLOCKER / CRITICAL / MAJOR / MINOR / TRIVIAL |
| status | String | 状态：NEW / ASSIGNED / FIXING / FIXED / CLOSED / REOPEN |
| assignee | String | 受理人 |
| reporter | String | 报告人 |
| description | String | 描述 |
| createTime | String | 创建时间 |
| moduleId | String | 所属模块 ID |

### 7.2 / 7.3 / 7.4 新建 / 更新 / 删除缺陷

body 为 `BugDTO`（`BugVO` 子集：title、severity、status、assignee、description、planId、moduleId 等）；新建/更新返回 `BugVO`，删除返回 `Result<Void>`。

---

## 8. 页面与 API 对照表

| 页面 | 路由 | 调用的 API |
| --- | --- | --- |
| 工作台首页 | `/workstation/home` | 总览 2.1、趋势 2.2 |
| 操作日志 | `/project/log` | 日志分页 3.1 |
| 用例列表 | `/test-case/list` | 用例分页 4.2、新建 4.4、删除 4.6（编辑弹窗另用模块树 4.1、更新 4.5；导入弹窗用 4.4） |
| 用例详情 | `/test-case/detail/:id` | 用例详情 4.3、更新 4.5、缺陷列表 7.1、新建缺陷 7.2、模块树 4.1、评审列表 4.10 |
| 用例评审 | `/test-case/review` | 评审列表 4.10、新建评审 4.11、用例分页 4.2（关联用例弹窗）、评审详情 4.12、提交结果 4.13 |
| 用例回收站 | `/test-case/recycle` | 回收站列表 4.7、恢复 4.8、彻底删除 4.9 |
| 计划列表 | `/test-plan/list` | 计划分页 5.1、新建 5.3、更新 5.4、删除 5.5、复制 5.6、用例分页 4.2（关联用例弹窗） |
| 测试报告 | `/test-plan/reports` | 报告列表 5.15、删除报告 5.16 |
| 计划执行详情 | `/test-plan/execute/:id` | 计划详情 5.2、更新 5.4、关联用例 5.7、计划历史 5.10、计划缺陷 5.11、导出 5.13 |
| 用例执行页 | `/test-plan/case-execute/:planId/:caseId` | 计划详情 5.2、用例详情 4.3、提交结果 5.8、用例历史 5.9、计划缺陷 5.11、新建缺陷 7.2、附件上传 5.17 |
| 计划报告 | `/test-plan/report/:id` | 报告 5.12、导出 5.13、分享 5.14、新建缺陷 7.2 |
| 接口定义 | `/api-test/definition` | 定义分页 6.3、新建 6.4、更新 6.5、删除 6.6、导入 6.7 |
| 接口调试 | `/api-test/debug` | 调试配置 6.1、发送请求 6.2、收藏夹 6.17~6.23 |
| 场景管理 | `/api-test/scenario` | 场景分页 6.8、新建 6.9、执行 6.12、删除 6.13 |
| 场景编辑 | `/api-test/scenario/edit/:id` | 场景详情 6.10、更新 6.11（刷新同 6.10） |
| 接口报告 | `/api-test/report` | 报告分页 6.14、详情 6.15、删除 6.16 |
| 缺陷列表 | `/bug/list` | 缺陷分页 7.1、新建 7.2、更新 7.3、删除 7.4 |

---

## 附：建议的 Java 工程结构

```
com.testengine
├── common
│   ├── Result.java              // 统一响应包装
│   ├── PageQuery.java           // 分页请求
│   ├── PageResult.java          // 分页响应
│   └── GlobalExceptionHandler.java  // code=401/500 等统一处理
├── controller
│   ├── WorkstationController.java
│   ├── ProjectController.java
│   ├── TestCaseController.java
│   ├── TestPlanController.java
│   ├── TestReportController.java
│   ├── ApiTestController.java
│   └── BugController.java
├── dto                          // *DTO（请求入参）、*Query（查询入参）
├── vo                           // *VO（响应出参）
└── service / mapper
```

*文档完。接口如有变更，请以 [src/api](file:///Users/fuhao/Downloads/TestEngine/src/api) 封装为准并同步修订本文档。*
