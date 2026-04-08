import html2canvas from 'html2canvas'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { usePersistentState } from './usePersistentState'
import { useQuizSubmission } from './useQuizSubmission'
import type { AppMode } from '../activities/types'

export type ImageTableWorksheetField = {
  id: string
  label: string
  answer: string
  widthCh: number
}

export type ImageTableWorksheetToken =
  | {
      type: 'text'
      value: string
    }
  | {
      type: 'field'
      fieldId: string
      placeholder: string
    }

export type ImageTableWorksheetRow = {
  id: string
  periodLabel: string
  lines: ImageTableWorksheetToken[][]
}

export type ImageTableWorksheetModuleConfig = {
  fields: ImageTableWorksheetField[]
  rows: ImageTableWorksheetRow[]
  summaryLabel?: string
  tableHeaders?: {
    period: string
    image: string
    content: string
  }
  saveImageFileName?: string
  saveImageTitle?: string
}

type ImageTableWorksheetModuleProps = ImageTableWorksheetModuleConfig & {
  storageKey: string
  mode: AppMode
  showAnswers: boolean
}

type ImageSelection = {
  kind: 'upload' | 'stock'
  src: string
}

type StockImageResult = {
  id: string
  title: string
  src: string
}

type StockSearchState = {
  status: 'idle' | 'loading' | 'done' | 'error'
  message?: string
  results: StockImageResult[]
  offset: number
  previousOffsets: number[]
  nextOffset: number | null
}

const defaultTableHeaders = {
  period: '시기',
  image: '그림',
  content: '내용',
}

function createEmptyAnswers(fields: ImageTableWorksheetField[]) {
  return fields.reduce<Record<string, string>>((accumulator, field) => {
    accumulator[field.id] = ''
    return accumulator
  }, {})
}

function createInitialSearchQueries(rows: ImageTableWorksheetRow[]) {
  return rows.reduce<Record<string, string>>((accumulator, row) => {
    accumulator[row.id] = ''
    return accumulator
  }, {})
}

function normalizeAnswer(value: string) {
  return value.replace(/\s+/g, '').replace(/[,.!?]/g, '').toLowerCase()
}

function isCorrectAnswer(inputValue: string, answer: string) {
  return normalizeAnswer(inputValue) === normalizeAnswer(answer)
}

async function searchCommonsImages(query: string, offset = 0) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '6',
    gsrlimit: '12',
    prop: 'imageinfo',
    iiprop: 'url',
    iiurlwidth: '640',
    format: 'json',
    origin: '*',
  })

  if (offset > 0) {
    params.set('gsroffset', String(offset))
  }

  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`)

  if (!response.ok) {
    throw new Error('이미지 검색에 실패했습니다.')
  }

  const data = await response.json()
  const pages = Object.values(data.query?.pages ?? {}) as Array<{
    pageid: number
    title: string
    index?: number
    imageinfo?: Array<{
      thumburl?: string
    }>
  }>

  const results = pages
    .sort((first, second) => (first.index ?? 0) - (second.index ?? 0))
    .map((page) => {
      const imageInfo = page.imageinfo?.[0]

      if (!imageInfo?.thumburl) {
        return null
      }

      return {
        id: String(page.pageid),
        title: page.title.replace(/^File:/, ''),
        src: imageInfo.thumburl,
      }
    })
    .filter((result): result is StockImageResult => result !== null)

  const nextOffset =
    typeof data.continue?.gsroffset === 'number' ? data.continue.gsroffset : null

  return {
    results,
    nextOffset,
  }
}

function clampNumber(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

function createTableScaleStyle(width: number): CSSProperties {
  const scale = clampNumber(width / 900, 0.76, 1.22)
  const imageScale = clampNumber(width / 960, 0.72, 1.16)

  return {
    ['--industry-head-font' as string]: `${0.84 + scale * 0.16}rem`,
    ['--industry-period-font' as string]: `${0.8 + scale * 0.2}rem`,
    ['--industry-content-font' as string]: `${0.76 + scale * 0.18}rem`,
    ['--industry-input-font' as string]: `${0.8 + scale * 0.2}rem`,
    ['--industry-head-padding-y' as string]: `${Math.round(6 + scale * 2)}px`,
    ['--industry-head-padding-x' as string]: `${Math.round(7 + scale * 3)}px`,
    ['--industry-period-padding-y' as string]: `${Math.round(10 + scale * 4)}px`,
    ['--industry-period-padding-x' as string]: `${Math.round(4 + scale * 4)}px`,
    ['--industry-art-padding' as string]: `${Math.round(6 + imageScale * 4)}px`,
    ['--industry-content-padding-y' as string]: `${Math.round(8 + scale * 4)}px`,
    ['--industry-content-padding-x' as string]: `${Math.round(8 + scale * 6)}px`,
    ['--industry-content-gap' as string]: `${Math.round(4 + scale * 4)}px`,
    ['--industry-line-gap' as string]: `${Math.round(2 + scale * 2)}px`,
    ['--industry-line-height' as string]: `${1.36 + scale * 0.19}`,
    ['--industry-input-height' as string]: `${1.8 + scale * 0.6}rem`,
    ['--industry-input-padding-x' as string]: `${0.22 + scale * 0.18}rem`,
    ['--industry-image-min-height' as string]: `${Math.round(108 + imageScale * 44)}px`,
    ['--industry-art-min-height' as string]: `${Math.round(128 + imageScale * 60)}px`,
  }
}

async function canvasToBlob(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((nextBlob) => resolve(nextBlob), 'image/png')
  })

  if (blob) {
    return blob
  }

  const dataUrl = canvas.toDataURL('image/png')
  const response = await fetch(dataUrl)
  return response.blob()
}

function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = fileName
  anchor.rel = 'noopener'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 1000)
}

function isAppleMobileSafari() {
  const userAgent = navigator.userAgent
  const vendor = navigator.vendor
  const isIosDevice = /iP(ad|hone|od)/.test(userAgent)
  const isIpadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  const isWebKitSafari =
    /Safari/i.test(userAgent) &&
    !/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser/i.test(userAgent) &&
    /Apple/i.test(vendor)

  return (isIosDevice || isIpadOs) && isWebKitSafari
}

async function waitForRenderableImages(container: HTMLElement) {
  const images = Array.from(container.querySelectorAll('img'))

  await Promise.all(
    images.map(async (image) => {
      if (image.complete && image.naturalWidth > 0) {
        return
      }

      if (typeof image.decode === 'function') {
        try {
          await image.decode()
          return
        } catch {
          // Fall through to load/error listeners.
        }
      }

      await new Promise<void>((resolve) => {
        const finalize = () => {
          image.removeEventListener('load', finalize)
          image.removeEventListener('error', finalize)
          resolve()
        }

        image.addEventListener('load', finalize, { once: true })
        image.addEventListener('error', finalize, { once: true })
      })
    }),
  )
}

function replaceInputsForCapture(clonedDocument: Document) {
  clonedDocument.querySelectorAll<HTMLInputElement>('.industry-sheet__input').forEach((input) => {
    const captureValue = input.value || input.placeholder || '\u00A0'
    const computedStyle = clonedDocument.defaultView?.getComputedStyle(input)
    const replacement = clonedDocument.createElement('span')

    replacement.textContent = captureValue
    replacement.setAttribute('aria-hidden', 'true')
    replacement.style.display = 'inline-flex'
    replacement.style.alignItems = 'center'
    replacement.style.justifyContent = 'center'
    replacement.style.boxSizing = 'border-box'
    replacement.style.minHeight = computedStyle?.minHeight || '2rem'
    replacement.style.height = computedStyle?.height || 'auto'
    replacement.style.width = computedStyle?.width || input.style.width || 'auto'
    replacement.style.maxWidth = '100%'
    replacement.style.padding = computedStyle?.padding || '0 0.4rem'
    replacement.style.border = '0'
    replacement.style.borderBottom = computedStyle?.borderBottom || '2px solid #7aa79d'
    replacement.style.background = computedStyle?.backgroundColor || 'rgba(255,255,255,0.94)'
    replacement.style.color = input.value
      ? computedStyle?.color || '#24313e'
      : computedStyle?.getPropertyValue('color') || 'rgba(95,107,123,0.86)'
    replacement.style.fontSize = computedStyle?.fontSize || '1rem'
    replacement.style.fontWeight = computedStyle?.fontWeight || '800'
    replacement.style.fontFamily = computedStyle?.fontFamily || 'inherit'
    replacement.style.lineHeight = computedStyle?.lineHeight || '1.2'
    replacement.style.letterSpacing = input.value ? 'normal' : '0.02em'
    replacement.style.whiteSpace = 'pre'
    replacement.style.textAlign = 'center'
    replacement.style.overflow = 'hidden'

    input.replaceWith(replacement)
  })
}

function renderToken(
  token: ImageTableWorksheetToken,
  fieldMap: Record<string, ImageTableWorksheetField>,
  mode: AppMode,
  showAnswers: boolean,
  answers: Record<string, string>,
  revealedFieldIds: Partial<Record<string, boolean>>,
  submitted: boolean,
  resultMap: Record<string, boolean>,
  onChange: (fieldId: string, value: string) => void,
  onToggleReveal: (fieldId: string) => void,
) {
  if (token.type === 'text') {
    return <span key={token.value}>{token.value}</span>
  }

  const field = fieldMap[token.fieldId]
  const answerVisible = mode === 'teacher' && (showAnswers || revealedFieldIds[field.id])
  const resultState = submitted
    ? resultMap[`text:${field.id}`]
      ? 'correct'
      : 'wrong'
    : undefined

  return (
    <span className="industry-sheet__field" key={field.id}>
      <span className="industry-sheet__sr-only">{field.label}</span>
      <span className="industry-sheet__field-stack">
        <input
          aria-label={field.label}
          autoComplete="off"
          className="industry-sheet__input"
          data-state={resultState}
          onChange={(event) => onChange(field.id, event.target.value)}
          placeholder={token.placeholder}
          spellCheck={false}
          style={{ minWidth: '6.5rem', width: `${field.widthCh}ch` }}
          type="text"
          value={answers[field.id] ?? ''}
        />
        {mode === 'teacher' ? (
          <button
            className="industry-sheet__answer-toggle"
            data-capture-hidden="true"
            onClick={() => onToggleReveal(field.id)}
            type="button"
          >
            {answerVisible ? '정답 숨김' : '정답 보기'}
          </button>
        ) : null}
        {answerVisible ? <span className="industry-sheet__answer">{field.answer}</span> : null}
      </span>
    </span>
  )
}

export function ImageTableWorksheetModule({
  storageKey,
  mode,
  showAnswers,
  fields,
  rows,
  summaryLabel,
  tableHeaders = defaultTableHeaders,
  saveImageFileName = 'image-table-worksheet.png',
  saveImageTitle = '이미지 병용 표 만들기',
}: ImageTableWorksheetModuleProps) {
  const tableWrapRef = useRef<HTMLDivElement | null>(null)
  const fieldMap = useMemo(
    () =>
      fields.reduce<Record<string, ImageTableWorksheetField>>((accumulator, field) => {
        accumulator[field.id] = field
        return accumulator
      }, {}),
    [fields],
  )
  const emptyAnswers = useMemo(() => createEmptyAnswers(fields), [fields])
  const [answers, setAnswers] = usePersistentState<Record<string, string>>(
    `${storageKey}:answers`,
    emptyAnswers,
  )
  const [revealedFieldIds, setRevealedFieldIds] = useState<Partial<Record<string, boolean>>>({})
  const [imageSelections, setImageSelections] = useState<Record<string, ImageSelection | undefined>>(
    {},
  )
  const [stockQueries, setStockQueries] = useState<Record<string, string>>(
    () => createInitialSearchQueries(rows),
  )
  const [stockSearchStates, setStockSearchStates] = useState<Record<string, StockSearchState>>({})
  const [activeSearchRowId, setActiveSearchRowId] = useState<string | null>(null)
  const [tableWidth, setTableWidth] = useState(900)
  const [isSavingImage, setIsSavingImage] = useState(false)
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null)

  const quiz = useQuizSubmission({
    itemIds: [
      ...fields.map((field) => `text:${field.id}`),
      ...rows.map((row) => `image:${row.id}`),
    ],
    grade: () => {
      const resultMap: Record<string, boolean> = {}

      fields.forEach((field) => {
        resultMap[`text:${field.id}`] = isCorrectAnswer(answers[field.id] ?? '', field.answer)
      })

      rows.forEach((row) => {
        resultMap[`image:${row.id}`] = Boolean(imageSelections[row.id]?.src)
      })

      return resultMap
    },
  })

  const activeSearchRow = rows.find((row) => row.id === activeSearchRowId) ?? null
  const activeSearchState = activeSearchRowId ? stockSearchStates[activeSearchRowId] : undefined
  const tableScaleStyle = useMemo(() => createTableScaleStyle(tableWidth), [tableWidth])

  useEffect(() => {
    const tableWrapElement = tableWrapRef.current

    if (!tableWrapElement) {
      return
    }

    const updateWidth = () => {
      setTableWidth(tableWrapElement.getBoundingClientRect().width)
    }

    updateWidth()

    const resizeObserver = new ResizeObserver(() => {
      updateWidth()
    })

    resizeObserver.observe(tableWrapElement)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const updateAnswer = (fieldId: string, value: string) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [fieldId]: value,
    }))
  }

  const updateStockQuery = (rowId: string, value: string) => {
    setStockQueries((currentQueries) => ({
      ...currentQueries,
      [rowId]: value,
    }))
  }

  const setImageSelection = (rowId: string, selection: ImageSelection) => {
    setImageSelections((currentSelections) => ({
      ...currentSelections,
      [rowId]: selection,
    }))
  }

  const clearImageSelection = (rowId: string) => {
    setImageSelections((currentSelections) => ({
      ...currentSelections,
      [rowId]: undefined,
    }))
  }

  const openSearchModal = (rowId: string) => {
    setActiveSearchRowId(rowId)
  }

  const closeSearchModal = () => {
    setActiveSearchRowId(null)
  }

  const toggleReveal = (fieldId: string) => {
    setRevealedFieldIds((current) => ({
      ...current,
      [fieldId]: !current[fieldId],
    }))
  }

  const resetAll = () => {
    setAnswers(emptyAnswers)
    setImageSelections({})
    setStockQueries(createInitialSearchQueries(rows))
    setStockSearchStates({})
    setRevealedFieldIds({})
    setActiveSearchRowId(null)
    setSaveFeedback(null)
    quiz.reset()
  }

  const handleUpload = (rowId: string, file: File | null) => {
    if (!file) {
      return
    }

    const fileReader = new FileReader()

    fileReader.onload = () => {
      const result = fileReader.result

      if (typeof result !== 'string') {
        return
      }

      setImageSelection(rowId, {
        kind: 'upload',
        src: result,
      })
    }

    fileReader.readAsDataURL(file)
  }

  const runStockSearch = async (
    rowId: string,
    offset = 0,
    previousOffsets: number[] = [],
  ) => {
    const query = (stockQueries[rowId] ?? '').trim()

    if (!query) {
      setStockSearchStates((currentStates) => ({
        ...currentStates,
        [rowId]: {
          status: 'error',
          message: '검색어를 입력해 주세요.',
          results: [],
          offset: 0,
          previousOffsets: [],
          nextOffset: null,
        },
      }))
      return
    }

    setStockSearchStates((currentStates) => ({
      ...currentStates,
      [rowId]: {
        status: 'loading',
        message: 'Wikimedia Commons에서 이미지를 찾는 중입니다.',
        results: [],
        offset,
        previousOffsets,
        nextOffset: null,
      },
    }))

    try {
      const { results, nextOffset } = await searchCommonsImages(query, offset)

      setStockSearchStates((currentStates) => ({
        ...currentStates,
        [rowId]: {
          status: 'done',
          message: results.length === 0 ? '검색 결과가 없습니다.' : undefined,
          results,
          offset,
          previousOffsets,
          nextOffset,
        },
      }))
    } catch (error) {
      setStockSearchStates((currentStates) => ({
        ...currentStates,
        [rowId]: {
          status: 'error',
          message:
            error instanceof Error ? error.message : '이미지 검색 중 오류가 발생했습니다.',
          results: [],
          offset,
          previousOffsets,
          nextOffset: null,
        },
      }))
    }
  }

  const saveTableAsImage = async () => {
    const tableWrapElement = tableWrapRef.current

    if (!tableWrapElement || isSavingImage) {
      return
    }

    setIsSavingImage(true)
    setSaveFeedback(null)

    try {
      if ('fonts' in document) {
        await document.fonts.ready
      }

      await waitForRenderableImages(tableWrapElement)

      const isMobileSafari = isAppleMobileSafari()
      const captureWidth = Math.ceil(tableWrapElement.scrollWidth)
      const captureHeight = Math.ceil(tableWrapElement.scrollHeight)
      const maxCanvasArea = isMobileSafari ? 3_000_000 : 12_000_000
      const areaScaleLimit = Math.sqrt(maxCanvasArea / Math.max(captureWidth * captureHeight, 1))
      const platformScaleCap = isMobileSafari ? 1.15 : 2
      const captureScale = clampNumber(
        Math.min(window.devicePixelRatio || 1, platformScaleCap, areaScaleLimit),
        0.78,
        platformScaleCap,
      )

      const canvas = await html2canvas(tableWrapElement, {
        backgroundColor: '#fffdf8',
        height: captureHeight,
        logging: false,
        scale: captureScale,
        useCORS: true,
        width: captureWidth,
        windowWidth: captureWidth,
        windowHeight: captureHeight,
        onclone: (clonedDocument) => {
          clonedDocument.querySelectorAll('[data-capture-hidden="true"]').forEach((element) => {
            if (element instanceof HTMLElement) {
              element.style.display = 'none'
            }
          })

          replaceInputsForCapture(clonedDocument)
        },
      })

      const blob = await canvasToBlob(canvas)
      const file = typeof File !== 'undefined'
        ? new File([blob], saveImageFileName, { type: 'image/png' })
        : null

      if (
        isMobileSafari &&
        navigator.share &&
        navigator.canShare &&
        file &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: saveImageTitle,
        })
        setSaveFeedback('공유 시트에서 이미지를 저장할 수 있어요.')
      } else {
        downloadBlob(blob, saveImageFileName)
        setSaveFeedback('이미지 저장을 시작했어요.')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setSaveFeedback(null)
      } else {
        setSaveFeedback('이미지 저장에 실패했어요. 다시 시도해 주세요.')
      }
    } finally {
      setIsSavingImage(false)
    }
  }

  return (
    <section className="industry-worksheet activity-module">
      <div className="industry-worksheet__toolbar activity-module__toolbar">
        <div className="industry-worksheet__toolbar-meta">
          {summaryLabel ? <span className="chip">{summaryLabel}</span> : null}
          <span className="chip">
            {quiz.correctCount} / {quiz.totalCount}
          </span>
          {quiz.submitted ? (
            <span
              className="chip"
              data-tone={quiz.correctCount === quiz.totalCount ? 'success' : 'danger'}
            >
              {quiz.correctCount === quiz.totalCount ? '모두 정답' : '다시 확인'}
            </span>
          ) : null}
          {mode === 'teacher' && showAnswers ? (
            <span className="chip" data-tone="teacher">
              교사용 정답 표시
            </span>
          ) : null}
          {saveFeedback ? <span className="chip">{saveFeedback}</span> : null}
          <button
            className="tiny-button"
            disabled={isSavingImage}
            onClick={saveTableAsImage}
            type="button"
          >
            {isSavingImage ? '이미지 준비 중' : '표 이미지 저장'}
          </button>
          <button
            className="tiny-button"
            data-tone={mode === 'teacher' ? 'teacher' : undefined}
            onClick={resetAll}
            type="button"
          >
            다시 하기
          </button>
        </div>
      </div>

      <section className="industry-sheet panel">
        <div className="industry-sheet__table-wrap" ref={tableWrapRef} style={tableScaleStyle}>
          <div className="industry-sheet__table">
            <div className="industry-sheet__head">{tableHeaders.period}</div>
            <div className="industry-sheet__head">{tableHeaders.image}</div>
            <div className="industry-sheet__head">{tableHeaders.content}</div>

            {rows.map((row) => {
              const selectedImage = imageSelections[row.id]
              const imageResultState = quiz.submitted
                ? quiz.resultMap[`image:${row.id}`]
                  ? 'correct'
                  : 'wrong'
                : undefined

              return (
                <div className="industry-sheet__row" key={row.id}>
                  <div className="industry-sheet__period">{row.periodLabel}</div>

                  <div className="industry-sheet__art-cell">
                    <div className="industry-sheet__image-block">
                      <input
                        accept="image/*"
                        className="industry-sheet__hidden-input"
                        id={`${storageKey}-upload-${row.id}`}
                        onChange={(event) => {
                          handleUpload(row.id, event.target.files?.[0] ?? null)
                          event.target.value = ''
                        }}
                        type="file"
                      />

                      {selectedImage?.src ? (
                        <div className="industry-sheet__preview" data-state={imageResultState}>
                          <img
                            alt={`${row.periodLabel} 선택 이미지`}
                            crossOrigin="anonymous"
                            src={selectedImage.src}
                          />
                          <label
                            aria-label={`${row.periodLabel} 이미지 업로드`}
                            className="industry-sheet__image-icon industry-sheet__image-icon--upload"
                            data-capture-hidden="true"
                            htmlFor={`${storageKey}-upload-${row.id}`}
                          >
                            ↑
                          </label>
                          <button
                            aria-label={`${row.periodLabel} 이미지 검색`}
                            className="industry-sheet__image-icon industry-sheet__image-icon--search"
                            data-capture-hidden="true"
                            onClick={() => openSearchModal(row.id)}
                            type="button"
                          >
                            ⌕
                          </button>
                        </div>
                      ) : (
                        <div className="industry-sheet__image-empty" data-state={imageResultState}>
                          <label
                            className="tiny-button"
                            data-capture-hidden="true"
                            htmlFor={`${storageKey}-upload-${row.id}`}
                          >
                            업로드
                          </label>
                          <button
                            className="tiny-button"
                            data-capture-hidden="true"
                            onClick={() => openSearchModal(row.id)}
                            type="button"
                          >
                            검색
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="industry-sheet__content">
                    {row.lines.map((line, index) => (
                      <p className="industry-sheet__line" key={`${row.id}-${index}`}>
                        {line.map((token) =>
                          renderToken(
                            token,
                            fieldMap,
                            mode,
                            showAnswers,
                            answers,
                            revealedFieldIds,
                            quiz.submitted,
                            quiz.resultMap,
                            updateAnswer,
                            toggleReveal,
                          ),
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <footer className="industry-sheet__footer activity-module__footer">
          <button className="pill-button" onClick={quiz.submit} type="button">
            정답 제출
          </button>
          <button className="pill-button" data-tone="secondary" onClick={resetAll} type="button">
            다시 하기
          </button>
        </footer>
      </section>

      {activeSearchRow ? (
        <div aria-modal="true" className="industry-search-modal" role="dialog">
          <button
            aria-label="검색 팝업 닫기"
            className="industry-search-modal__backdrop"
            onClick={closeSearchModal}
            type="button"
          />
          <section className="industry-search-modal__panel panel">
            <header className="industry-search-modal__header">
              <div>
                <h3>{activeSearchRow.periodLabel} 이미지 검색</h3>
                <p>Wikimedia Commons에서 이미지를 찾아 선택하세요.</p>
              </div>
              <button className="tiny-button" onClick={closeSearchModal} type="button">
                닫기
              </button>
            </header>

            <form
              className="industry-search-modal__toolbar"
              onSubmit={(event) => {
                event.preventDefault()
                runStockSearch(activeSearchRow.id)
              }}
            >
              <input
                className="industry-sheet__stock-input"
                onChange={(event) => updateStockQuery(activeSearchRow.id, event.target.value)}
                type="search"
                value={stockQueries[activeSearchRow.id] ?? ''}
              />
              <button className="pill-button" type="submit">
                검색
              </button>
            </form>

            {activeSearchState?.message ? (
              <p className="industry-search-modal__message">{activeSearchState.message}</p>
            ) : null}

            <div className="industry-search-modal__results">
              {activeSearchState?.results.map((result) => (
                <button
                  className="industry-search-modal__result"
                  data-selected={imageSelections[activeSearchRow.id]?.src === result.src}
                  key={result.id}
                  onClick={() => {
                    setImageSelection(activeSearchRow.id, {
                      kind: 'stock',
                      src: result.src,
                    })
                    closeSearchModal()
                  }}
                  type="button"
                >
                  <img alt={result.title} crossOrigin="anonymous" src={result.src} />
                </button>
              ))}
            </div>

            <div className="industry-search-modal__actions">
              <div className="industry-search-modal__paging">
                <button
                  className="tiny-button"
                  disabled={!activeSearchState?.previousOffsets.length}
                  onClick={() => {
                    const previousOffsets = activeSearchState?.previousOffsets ?? []
                    const previousOffset = previousOffsets[previousOffsets.length - 1] ?? 0
                    runStockSearch(
                      activeSearchRow.id,
                      previousOffset,
                      previousOffsets.slice(0, -1),
                    )
                  }}
                  type="button"
                >
                  이전 결과
                </button>
                <button
                  className="tiny-button"
                  disabled={!activeSearchState?.nextOffset}
                  onClick={() => {
                    const nextOffset = activeSearchState?.nextOffset

                    if (typeof nextOffset !== 'number') {
                      return
                    }

                    runStockSearch(activeSearchRow.id, nextOffset, [
                      ...(activeSearchState?.previousOffsets ?? []),
                      activeSearchState?.offset ?? 0,
                    ])
                  }}
                  type="button"
                >
                  다음 결과
                </button>
              </div>
              <button
                className="pill-button"
                data-tone="secondary"
                onClick={() => {
                  clearImageSelection(activeSearchRow.id)
                  closeSearchModal()
                }}
                type="button"
              >
                이미지 지우기
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  )
}
