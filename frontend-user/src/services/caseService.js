const DEFAULT_GRADIENT = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

const DEFAULT_RESULTS = [
  { value: '持续提升', label: '运营效率' },
  { value: '全程可视', label: '物流链路' }
]

const FALLBACK_CASES = [
  {
    title: '物流数字化实践案例',
    industry: '综合物流',
    tag: 'all',
    description: '网络异常时展示的备用案例，帮助用户继续了解知运的实施能力。',
    challenge: '运输、仓储和配送环节数据分散，管理者难以及时掌握业务状态。',
    solution: '通过统一的智慧物流平台整合订单、仓储、运输与配送数据。',
    gradient: DEFAULT_GRADIENT,
    results: DEFAULT_RESULTS
  }
]

function normalizeResult(result, index) {
  if (!result || typeof result !== 'object') {
    return DEFAULT_RESULTS[index] || { value: '持续提升', label: `指标${index + 1}` }
  }

  const value = String(result.value || '').trim()
  const label = String(result.label || '').trim()

  return {
    value: value || '持续提升',
    label: label || `指标${index + 1}`
  }
}

function normalizeCase(item, index) {
  if (!item || typeof item !== 'object') {
    return FALLBACK_CASES[0]
  }

  const title = String(item.title || '').trim()
  const industry = String(item.industry || '').trim()
  const tag = String(item.tag || '').trim()
  const description = String(item.description || '').trim()
  const challenge = String(item.challenge || '').trim()
  const solution = String(item.solution || '').trim()
  const results = Array.isArray(item.results) && item.results.length > 0
    ? item.results.map(normalizeResult)
    : DEFAULT_RESULTS

  return {
    title: title || `成功案例 ${index + 1}`,
    industry: industry || '物流行业',
    tag: tag || 'unknown',
    description: description || '暂无案例简介。',
    challenge: challenge || '客户需要提升物流作业效率与可视化管理能力。',
    solution: solution || '提供智慧仓储、运输调度与配送追踪一体化方案。',
    gradient: item.gradient || DEFAULT_GRADIENT,
    results
  }
}

function normalizeCases(payload) {
  const rawCases = Array.isArray(payload) ? payload : payload?.cases

  if (!Array.isArray(rawCases) || rawCases.length === 0) {
    return FALLBACK_CASES
  }

  return rawCases.map(normalizeCase)
}

export async function fetchCases(signal) {
  const response = await fetch(`${import.meta.env.BASE_URL}data/cases.json`, { signal })

  if (!response.ok) {
    throw new Error(`案例数据加载失败（${response.status}）`)
  }

  return normalizeCases(await response.json())
}
