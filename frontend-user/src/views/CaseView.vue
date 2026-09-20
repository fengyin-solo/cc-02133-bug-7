<template>
  <div class="case-page">
    <!-- 页面头部 -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">案例展示</h1>
        <p class="page-subtitle">众多企业的信赖之选，见证智慧物流的力量</p>
      </div>
    </section>

    <!-- 筛选标签：与地址栏 ?tag= 保持同步 -->
    <section class="filter-section">
      <div class="container">
        <nav class="filter-tags" aria-label="案例行业筛选">
          <el-button
            v-for="tag in tags"
            :key="tag.value"
            :type="activeTag === tag.value ? 'primary' : ''"
            :aria-current="activeTag === tag.value ? 'true' : undefined"
            round
            @click="selectTag(tag.value)"
          >
            {{ tag.label }}
          </el-button>
        </nav>
      </div>
    </section>

    <!-- 案例列表 -->
    <section class="section section-gray">
      <div class="container">
        <!-- 加载中：骨架占位，避免连续切换标签时残留上一次的卡片 -->
        <div v-if="loading" class="case-grid" v-loading="true" element-loading-text="案例加载中...">
          <div v-for="n in 4" :key="n" class="case-skeleton" aria-hidden="true">
            <div class="skeleton-header"></div>
            <div class="skeleton-body">
              <div class="skeleton-line skeleton-line--title"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line skeleton-line--short"></div>
            </div>
          </div>
        </div>

        <!-- 加载失败：可重试 -->
        <div v-else-if="error" class="case-state">
          <el-result icon="error" title="案例加载失败" sub-title="网络开小差了，请稍后重试">
            <template #extra>
              <el-button type="primary" @click="loadCases(activeTag)">重新加载</el-button>
            </template>
          </el-result>
        </div>

        <!-- 空态：该行业组合下暂无案例 -->
        <div v-else-if="filteredCases.length === 0" class="case-state">
          <el-empty :description="emptyDescription">
            <el-button type="primary" @click="resetFilter">查看全部案例</el-button>
          </el-empty>
        </div>

        <!-- 案例卡片 -->
        <div v-else class="case-grid">
          <div
            class="case-detail-card"
            v-for="caseItem in filteredCases"
            :key="caseItem.title"
          >
            <div class="case-header" :style="{ background: caseItem.gradient }">
              <div class="case-logo">
                <el-icon :size="48"><OfficeBuilding /></el-icon>
              </div>
              <div class="case-tag">{{ caseItem.industry }}</div>
            </div>
            <div class="case-body">
              <h3 class="case-title">{{ caseItem.title }}</h3>
              <p class="case-desc">{{ caseItem.description }}</p>

              <div class="case-challenge">
                <h4><el-icon><Warning /></el-icon> 面临挑战</h4>
                <p>{{ caseItem.challenge }}</p>
              </div>

              <div class="case-solution">
                <h4><el-icon><Checked /></el-icon> 解决方案</h4>
                <p>{{ caseItem.solution }}</p>
              </div>

              <!-- 实施效果卡 -->
              <div class="case-results">
                <h4>实施效果</h4>
                <div class="result-items">
                  <div class="result-item" v-for="result in caseItem.results" :key="result.label">
                    <span class="result-value">{{ result.value }}</span>
                    <span class="result-label">{{ result.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 客户评价 -->
    <section class="section section-light">
      <div class="container">
        <SectionTitle
          title="客户评价"
          subtitle="听听他们怎么说"
        />
        <div class="testimonial-grid">
          <div class="testimonial-card" v-for="testimonial in testimonials" :key="testimonial.name">
            <div class="quote-icon">
              <el-icon :size="32"><ChatDotSquare /></el-icon>
            </div>
            <p class="testimonial-content">{{ testimonial.content }}</p>
            <div class="testimonial-author">
              <div class="author-avatar">
                <el-icon :size="24"><User /></el-icon>
              </div>
              <div class="author-info">
                <h4>{{ testimonial.name }}</h4>
                <p>{{ testimonial.title }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section cta-section">
      <div class="container text-center">
        <h2 class="cta-title">想成为下一个成功案例？</h2>
        <p class="cta-desc">联系我们，开启您的智慧物流之旅</p>
        <el-button type="primary" size="large" round @click="$router.push('/contact')">
          立即咨询
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SectionTitle from '@/components/SectionTitle.vue'

const route = useRoute()
const router = useRouter()

const DEFAULT_TAG = 'all'

const tags = [
  { label: '全部案例', value: 'all' },
  { label: '电商物流', value: 'ecommerce' },
  { label: '快递物流', value: 'express' },
  { label: '零售配送', value: 'retail' },
  { label: '制造业', value: 'manufacturing' }
]

const tagValues = new Set(tags.map(t => t.value))
const tagLabelMap = new Map(tags.map(t => [t.value, t.label]))

const allCases = [
  {
    title: '某大型电商平台',
    industry: '电商物流',
    tag: 'ecommerce',
    description: '国内领先的综合电商平台，日均订单量超过500万单',
    challenge: '仓库作业效率低下，库存准确率不足95%，大促期间频繁出现爆仓情况',
    solution: '部署知运智慧仓储系统，实现库位智能分配、拣货路径优化、库存实时监控',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    results: [
      { value: '40%', label: '效率提升' },
      { value: '99.9%', label: '库存准确率' },
      { value: '30%', label: '成本降低' }
    ]
  },
  {
    title: '某知名快递企业',
    industry: '快递物流',
    tag: 'express',
    description: '全国性快递服务商，网点覆盖全国300+城市',
    challenge: '运输成本居高不下，车辆利用率低，运输时效难以保障',
    solution: '采用知运运输管理系统，实现智能路径规划、运力资源整合、全程可视追踪',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    results: [
      { value: '25%', label: '成本降低' },
      { value: '20%', label: '时效提升' },
      { value: '35%', label: '车辆利用率提升' }
    ]
  },
  {
    title: '某连锁零售集团',
    industry: '零售配送',
    tag: 'retail',
    description: '拥有2000+门店的连锁零售企业，覆盖华南地区',
    challenge: '门店配送准时率低，客户投诉多，配送成本高',
    solution: '使用知运配送调度系统，实现智能派单、路线优化、电子签收',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    results: [
      { value: '98%', label: '准时率' },
      { value: '50%', label: '投诉减少' },
      { value: '20%', label: '成本降低' }
    ]
  },
  {
    title: '某汽车零部件制造商',
    industry: '制造业',
    tag: 'manufacturing',
    description: '国内知名汽车零部件供应商，服务多家主机厂',
    challenge: '供应链协同困难，库存周转慢，无法满足JIT配送要求',
    solution: '部署知运全套物流系统，实现供应链可视化、库存精准管控、准时配送',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    results: [
      { value: '99.5%', label: '准时交付率' },
      { value: '40%', label: '库存周转提升' },
      { value: '15%', label: '运营成本降低' }
    ]
  },
  {
    title: '某生鲜电商平台',
    industry: '电商物流',
    tag: 'ecommerce',
    description: '专注生鲜配送的电商平台，主打2小时达服务',
    challenge: '生鲜损耗率高，配送时效难以保障，冷链管理困难',
    solution: '定制化冷链物流解决方案，实现温度全程监控、智能调度、损耗预警',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    results: [
      { value: '60%', label: '损耗降低' },
      { value: '95%', label: '2小时达成率' },
      { value: '25%', label: '成本优化' }
    ]
  },
  {
    title: '某医药流通企业',
    industry: '制造业',
    tag: 'manufacturing',
    description: '华南地区领先的医药流通企业，服务5000+医疗机构',
    challenge: '药品追溯要求严格，效期管理复杂，合规风险高',
    solution: '部署符合GSP要求的仓储系统，实现全程追溯、效期预警、合规管理',
    gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    results: [
      { value: '100%', label: '追溯覆盖率' },
      { value: '0', label: '合规问题' },
      { value: '30%', label: '效率提升' }
    ]
  }
]

const testimonials = [
  {
    content: '知运的智慧仓储系统帮助我们实现了仓库作业的全面升级，效率提升非常明显，团队都很满意。',
    name: '王经理',
    title: '某电商平台物流总监'
  },
  {
    content: '运输管理系统的智能调度功能非常强大，帮我们节省了大量的运输成本，ROI超出预期。',
    name: '李总',
    title: '某快递企业运营副总'
  },
  {
    content: '配送系统上线后，门店配送准时率大幅提升，客户满意度明显提高，非常感谢知运团队。',
    name: '张总监',
    title: '某零售集团供应链总监'
  }
]

const loading = ref(false)
const error = ref(false)
const displayedCases = ref([])

// 当前生效的筛选条件，始终是 tags 中存在的合法值；未知值统一回退到“全部案例”
const activeTag = computed(() => {
  const raw = route.query.tag
  const value = Array.isArray(raw) ? raw[0] : raw
  return value && tagValues.has(value) ? value : DEFAULT_TAG
})

const filteredCases = computed(() => {
  if (activeTag.value === DEFAULT_TAG) {
    return displayedCases.value
  }
  return displayedCases.value.filter(c => c.tag === activeTag.value)
})

const emptyDescription = computed(() =>
  `暂无「${tagLabelMap.get(activeTag.value) || '该行业'}」相关案例，换个行业看看吧`
)

// 请求序号：连续点击标签时，只有最后一次请求的结果会生效，旧结果一律丢弃
let fetchSequence = 0

/**
 * 加载指定行业的案例。
 * 当前为静态数据（一次性返回全部、前端按 tag 过滤），用短延时模拟请求以覆盖加载/竞态逻辑；
 * tag 参数预留给真实接口（如 fetchCases(tag)），接入时只需替换函数体，调用方与状态机无需改动。
 */
const loadCases = (tag) => {
  const seq = ++fetchSequence
  loading.value = true
  error.value = false

  return new Promise(resolve => {
    setTimeout(() => resolve(allCases), 260)
  })
    .then(data => {
      // 过期响应（用户已切换到别的标签）直接丢弃，防止旧结果残留
      if (seq !== fetchSequence) return
      displayedCases.value = Array.isArray(data) ? data : []
      error.value = false
    })
    .catch(() => {
      if (seq !== fetchSequence) return
      displayedCases.value = []
      error.value = true
    })
    .finally(() => {
      if (seq === fetchSequence) {
        loading.value = false
      }
    })
}

// 点击标签：写入地址栏（push，可通过浏览器后退恢复上一次筛选）
const selectTag = (value) => {
  if (value === activeTag.value) return
  router.push({ name: 'Cases', query: value === DEFAULT_TAG ? {} : { tag: value } })
}

// 空态下一键清空筛选条件
const resetFilter = () => {
  if (activeTag.value === DEFAULT_TAG) {
    loadCases(DEFAULT_TAG)
    return
  }
  router.push({ name: 'Cases', query: {} })
}

// 地址栏中的筛选条件变化（前进/后退/手动改 URL/首次进入）统一处理
watch(
  () => route.query.tag,
  (rawTag) => {
    const rawValue = Array.isArray(rawTag) ? rawTag[0] : rawTag
    if (rawValue && !tagValues.has(rawValue)) {
      // 未知值：提示后静默回退到全部案例，保证高亮、列表、地址三者一致
      ElMessage.warning('未找到该筛选分类，已为您展示全部案例')
      router.replace({ name: 'Cases', query: {} })
      return
    }
    loadCases(activeTag.value)
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.page-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: $spacing-xxl 0;
  text-align: center;
  color: #fff;
}

.page-title {
  font-size: $font-size-xxxl;
  font-weight: 700;
  margin-bottom: $spacing-sm;
}

.page-subtitle {
  font-size: $font-size-lg;
  opacity: 0.75;
}

.filter-section {
  background: $bg-white;
  padding: $spacing-lg 0;
  border-bottom: 1px solid $border-light;
}

.filter-tags {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
  justify-content: center;
}

.case-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-xl;
  min-height: 320px;
  align-content: start;
}

.case-state {
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.case-skeleton {
  background: $bg-white;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-md;
}

.skeleton-header {
  height: 160px;
  background: linear-gradient(135deg, #e3e7ef 0%, #eef1f6 100%);
}

.skeleton-body {
  padding: $spacing-lg;
}

.skeleton-line {
  height: 14px;
  border-radius: $radius-sm;
  background: #f0f2f5;
  margin-bottom: $spacing-md;

  &--title {
    height: 20px;
    width: 55%;
  }

  &--short {
    width: 70%;
  }
}

.case-detail-card {
  background: $bg-white;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-md;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-8px);
    box-shadow: $shadow-lg;
  }
}

.case-header {
  height: 160px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.case-logo {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.case-tag {
  position: absolute;
  top: $spacing-md;
  right: $spacing-md;
  background: rgba(255, 255, 255, 0.9);
  color: $text-primary;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: 500;
}

.case-body {
  padding: $spacing-lg;
}

.case-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.case-desc {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin-bottom: $spacing-md;
}

.case-challenge,
.case-solution {
  margin-bottom: $spacing-md;

  h4 {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-sm;
    color: $text-primary;
    margin-bottom: $spacing-xs;

    .el-icon {
      color: $warning-color;
    }
  }

  p {
    font-size: $font-size-sm;
    color: $text-secondary;
    padding-left: 24px;
  }
}

.case-solution h4 .el-icon {
  color: $success-color;
}

.case-results {
  background: $bg-color;
  margin: 0 (-$spacing-lg) (-$spacing-lg);
  padding: $spacing-md $spacing-lg;

  h4 {
    font-size: $font-size-sm;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }
}

.result-items {
  display: flex;
  gap: $spacing-lg;
}

.result-item {
  text-align: center;

  .result-value {
    display: block;
    font-size: $font-size-xl;
    font-weight: 700;
    color: $primary-color;
  }

  .result-label {
    font-size: $font-size-xs;
    color: $text-secondary;
  }
}

.testimonial-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-lg;
}

.testimonial-card {
  background: $bg-white;
  padding: $spacing-xl;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  position: relative;
}

.quote-icon {
  color: rgba($primary-color, 0.2);
  margin-bottom: $spacing-md;
}

.testimonial-content {
  font-size: $font-size-base;
  color: $text-regular;
  line-height: $line-height-loose;
  margin-bottom: $spacing-lg;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.author-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.author-info {
  h4 {
    font-size: $font-size-base;
    color: $text-primary;
  }

  p {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.cta-section {
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  color: #fff;
}

.cta-title {
  font-size: $font-size-xxl;
  font-weight: 700;
  margin-bottom: $spacing-md;
}

.cta-desc {
  font-size: $font-size-lg;
  opacity: 0.85;
  margin-bottom: $spacing-xl;
}

@media (max-width: $breakpoint-lg) {
  .case-grid {
    grid-template-columns: 1fr;
  }

  .testimonial-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: $breakpoint-md) {
  .page-title {
    font-size: $font-size-xxl;
  }

  .result-items {
    flex-wrap: wrap;
  }
}
</style>
