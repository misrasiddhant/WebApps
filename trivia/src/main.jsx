import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowLeft, ArrowRight, Check, Home, RotateCcw, SkipForward, Sparkles, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { io } from 'socket.io-client'
import './styles.css'

const resourceUrls = import.meta.glob('./data/resources/**/*.{jpg,jpeg,png,webp,gif,svg}', { eager: true, query: '?url', import: 'default' })
const isPhoneMode = new URLSearchParams(window.location.search).get('phone') === '1'

function shuffleQuestionOptions(question) {
  const options = question.options.map((text, index) => ({ text, isCorrect: index === question.correctAnswer }))
  for (let index = options.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[options[index], options[swapIndex]] = [options[swapIndex], options[index]]
  }
  return {
    ...question,
    options: options.map(({ text }) => text),
    correctAnswer: options.findIndex(({ isCorrect }) => isCorrect),
  }
}

const categories = Object.values(import.meta.glob('./data/*.json', { eager: true, import: 'default' })).map((category) => ({
  ...category,
  questions: category.questions.map(shuffleQuestionOptions),
}))

function resolveResourceUrl(resourcePath) {
  if (!resourcePath?.startsWith('/data/resources/')) return resourcePath
  return resourceUrls[`./${resourcePath.slice(1)}`] || resourcePath
}

function renderFact(fact) {
  return fact.split('**').map((part, index) => index % 2 === 1 ? <strong key={index}>{part}</strong> : part)
}

function App() {
  if (isPhoneMode) return <PhoneBuzzer />

  const [category, setCategory] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [answerAttempts, setAnswerAttempts] = useState({})
  const [buzzerState, setBuzzerState] = useState({ firstTap: null, buzzerOpen: false, buzzerUnlockAt: null, buzzerQueue: [], teams: [] })
  const [socket, setSocket] = useState(null)
  const [isImageOpen, setIsImageOpen] = useState(false)
  const [negativeMarking, setNegativeMarking] = useState(false)

  useEffect(() => {
    const connection = io()
    connection.on('buzzer:state', setBuzzerState)
    setSocket(connection)
    return () => connection.disconnect()
  }, [])

  useEffect(() => {
    if (!isImageOpen) return undefined
    function closeOnEscape(event) {
      if (event.key === 'Escape') setIsImageOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isImageOpen])

  const question = category?.questions[questionIndex]
  const selectedAnswer = question ? answers[questionIndex] : undefined
  const attemptedAnswer = question ? (selectedAnswer ?? answerAttempts[questionIndex]) : undefined
  const answeredCount = Object.keys(answers).length
  const score = category ? category.questions.reduce((total, item, index) => total + (answers[index] === item.correctAnswer ? 1 : 0), 0) : 0
  const finished = category && questionIndex === category.questions.length - 1 && selectedAnswer !== undefined

  function chooseCategory(nextCategory) {
    socket?.emit('buzzer:reset')
    setCategory(nextCategory)
    setQuestionIndex(0)
    setAnswers({})
    setAnswerAttempts({})
    setIsImageOpen(false)
  }

  function goHome() {
    socket?.emit('buzzer:reset')
    setCategory(null)
    setQuestionIndex(0)
    setAnswers({})
    setAnswerAttempts({})
    setIsImageOpen(false)
  }

  function selectAnswer(answerIndex) {
    if (selectedAnswer !== undefined) return
    const isCorrect = answerIndex === question.correctAnswer
    setAnswerAttempts((current) => ({ ...current, [questionIndex]: answerIndex }))
    if (buzzerState.firstTap) {
      if (isCorrect) setAnswers((current) => ({ ...current, [questionIndex]: answerIndex }))
      socket?.emit(isCorrect ? 'answer:correct' : 'answer:incorrect', isCorrect ? undefined : { negativeMarking })
      if (!isCorrect) setAnswers((current) => {
        const next = { ...current }
        delete next[questionIndex]
        return next
      })
      return
    }
    if (isCorrect) setAnswers((current) => ({ ...current, [questionIndex]: answerIndex }))
  }

  function nextQuestion() {
    socket?.emit('buzzer:reset')
    setIsImageOpen(false)
    if (questionIndex < category.questions.length - 1) setQuestionIndex((current) => current + 1)
  }

  function previousQuestion() {
    socket?.emit('buzzer:reset')
    setIsImageOpen(false)
    if (questionIndex > 0) setQuestionIndex((current) => current - 1)
  }

  function restart() {
    socket?.emit('buzzer:reset')
    setQuestionIndex(0)
    setAnswers({})
    setAnswerAttempts({})
    setIsImageOpen(false)
  }

  if (!category) return <CategoryPicker onChoose={chooseCategory} buzzerState={buzzerState} resetBuzzer={() => socket?.emit('buzzer:reset')} />

  return (
    <main className="game-shell" style={{ '--primary': category.theme.primary, '--secondary': category.theme.secondary, '--accent': category.theme.accent, '--ink': category.theme.ink }}>
      <header className="topbar">
        <div className="topbar-identity"><button className="brand" onClick={goHome} aria-label="Go to categories"><span className="brand-mark"><Sparkles size={16} /></span> Trivia</button><span className="topbar-divider" /><div className="topbar-category"><strong>{category.displayName}</strong></div></div>
        <div className="topbar-actions"><span className="progress-label">{answeredCount} / {category.questions.length} answered</span><span className="topbar-score">Score <strong>{score}</strong></span><button className="icon-button" onClick={goHome} aria-label="Choose another category" title="Choose another category"><Home size={18} /></button></div>
      </header>

      <section className="game-content">
        <div className="progress-track" aria-label={`Question ${questionIndex + 1} of ${category.questions.length}`}><span style={{ width: `${((questionIndex + 1) / category.questions.length) * 100}%`, background: category.theme.primary }} /></div>
        <div className="buzzer-winner game-buzzer-winner"><div><span>{buzzerState.buzzerOpen ? 'Buzzer open' : 'Get ready'}</span>{buzzerState.buzzerOpen && buzzerState.firstTap && <strong>Answer for {buzzerState.firstTap.name}</strong>}</div><button className={`negative-marking-switch ${negativeMarking ? 'is-on' : ''}`} type="button" role="switch" aria-checked={negativeMarking} onClick={() => setNegativeMarking((current) => !current)}><span className="switch-track"><span className="switch-thumb" /></span><span>Negative marking (-1)</span></button></div>
        {buzzerState.buzzerQueue?.length > 0 && <aside className="buzzer-order"><span>Buzz order</span><ol>{buzzerState.buzzerQueue.map((team, index) => <li className={index === 0 ? 'buzzer-order-active' : ''} key={`${team.name}-${team.attempt}`}><strong>{team.name}</strong>{index === 0 && <small>Answering</small>}</li>)}</ol></aside>}

        <div className="question-layout">
          <aside className="visual-column">
            {question.mediaURL ? <button className="question-media-button" onClick={() => setIsImageOpen(true)} aria-label="View image full size" title="View image full size"><img className="question-media" src={resolveResourceUrl(question.mediaURL)} alt="Visual clue for the question" /></button> : <img className="question-media question-page-image" src={resolveResourceUrl(category.pageImage || category.backgroundImage)} alt={`${category.displayName} visual`} />}
          </aside>
          <section className="question-card">
            <p className="question-count">Question {questionIndex + 1} of {category.questions.length}</p>
            <h2>{question.prompt}</h2>
            <div className="options" role="radiogroup" aria-label="Answer choices">{question.options.map((option, index) => <button key={option} className={`option ${attemptedAnswer === index ? (index === question.correctAnswer ? 'correct' : 'incorrect') : ''}`} onClick={() => selectAnswer(index)} disabled={selectedAnswer !== undefined} role="radio" aria-checked={selectedAnswer === index}><span className="option-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>{selectedAnswer === index && index === question.correctAnswer && <Check size={18} />}</button>)}</div>
            {attemptedAnswer !== undefined && <p className={`feedback ${selectedAnswer === question.correctAnswer ? 'feedback-correct' : 'feedback-incorrect'}`}>{selectedAnswer === question.correctAnswer ? 'Nice one. That is correct.' : 'Try again.'}</p>}
            {selectedAnswer === question.correctAnswer && question.fact && <p className="question-fact">{renderFact(question.fact)}</p>}
            <div className="question-actions"><button className="text-button" onClick={previousQuestion} disabled={questionIndex === 0}><ArrowLeft size={17} /> Back</button><div className="right-actions"><button className="text-button skip-button" onClick={nextQuestion} disabled={questionIndex === category.questions.length - 1 || selectedAnswer !== undefined}><SkipForward size={16} /> Skip</button>{finished ? <button className="primary-button" onClick={restart}><RotateCcw size={16} /> Play again</button> : <button className="primary-button" onClick={nextQuestion} disabled={selectedAnswer === undefined}>Next <ArrowRight size={16} /></button>}</div></div>
          </section>
        </div>
      </section>
      {isImageOpen && <div className="image-lightbox" role="dialog" aria-modal="true" aria-label="Full-size visual clue" onClick={() => setIsImageOpen(false)}><button className="image-lightbox-close" onClick={() => setIsImageOpen(false)} aria-label="Close full-size image" title="Close full-size image"><X size={24} /></button><img src={resolveResourceUrl(question.mediaURL)} alt="Full-size visual clue for the question" onClick={(event) => event.stopPropagation()} /></div>}
    </main>
  )
}

function CategoryPicker({ onChoose, buzzerState, resetBuzzer }) {
  const [mobileUrl, setMobileUrl] = useState(null)
  const [accessError, setAccessError] = useState('')

  useEffect(() => {
    fetch('/api/access')
      .then((response) => {
        if (!response.ok) throw new Error('The local server did not provide an access URL.')
        return response.json()
      })
      .then(({ url }) => {
        if (!url || new URL(url).hostname === 'localhost') throw new Error('The server returned a localhost URL.')
        setMobileUrl(url)
      })
      .catch((error) => setAccessError(error.message))
  }, [])

  const phoneUrl = mobileUrl ? `${mobileUrl}/?phone=1` : ''
  return <main className="home-shell"><header className="topbar"><div className="brand"><span className="brand-mark"><Sparkles size={16} /></span> Trivia</div><div className="network-badge"><span className="network-dot" /> Local game</div></header><section className="home-content"><div className="intro"><p className="eyebrow">Pick a category</p><p className="intro-copy">Choose a category and see how much you know.</p></div>{buzzerState.firstTap && <div className="buzzer-winner"><span>{buzzerState.firstTap.attempt > 1 ? 'Second team' : 'First buzzer'}</span><strong>{buzzerState.firstTap.name}</strong><button className="primary-button" onClick={resetBuzzer}>Reset buzzer</button></div>}<Scoreboard teams={buzzerState.teams} /><div className="category-grid">{categories.map((item, index) => <button className="category-card" key={item.id} onClick={() => onChoose(item)} style={{ '--card-primary': item.theme.primary, '--card-secondary': item.theme.secondary }}><span className="category-number">{String(index + 1).padStart(2, '0')}</span><div className="category-image" style={{ backgroundImage: `url(${resolveResourceUrl(item.mainImage || item.backgroundImage)})` }} /><div className="category-details"><p>{item.eyebrow}</p><h2>{item.displayName}</h2><span>{item.questions.length} questions <ArrowRight size={15} /></span></div></button>)}</div><div className="home-footer"><span>{buzzerState.teams.length} team{buzzerState.teams.length === 1 ? '' : 's'} joined</span><div className="qr-panel">{mobileUrl ? <QRCodeSVG value={phoneUrl} size={120} bgColor="#fffaf5" fgColor="#282623" includeMargin /> : <div className="qr-placeholder"><strong>{accessError ? 'QR code unavailable' : 'Preparing QR code'}</strong><small>{accessError || 'Connecting to the local server...'}</small></div>}<div><strong>Scan to join and buzz</strong>{mobileUrl && <small>{phoneUrl.replace(/^https?:\/\//, '')}</small>}<small>Connect to the same Wi-Fi</small></div></div></div></section></main>
}

function Scoreboard({ teams }) {
  if (!teams.length) return null
  return <section className="scoreboard"><div className="scoreboard-title">Scoreboard</div>{teams.slice().sort((left, right) => right.score - left.score).map((team) => <div className="score-row" key={team.name}><span>{team.name}</span><strong>{team.score}</strong></div>)}</section>
}

function PhoneBuzzer() {
  const [teamName, setTeamName] = useState('')
  const [joinedTeam, setJoinedTeam] = useState(() => localStorage.getItem('trivia-team-name') || '')
  const [teamId, setTeamId] = useState(() => localStorage.getItem('trivia-team-id') || '')
  const [buzzerState, setBuzzerState] = useState({ firstTap: null, buzzerOpen: false, buzzerUnlockAt: null, buzzerQueue: [], teams: [] })
  const [socket, setSocket] = useState(null)
  const [joinError, setJoinError] = useState('')

  useEffect(() => {
    const connection = io()
    connection.on('buzzer:state', setBuzzerState)
    connection.on('connect', () => {
      const savedName = localStorage.getItem('trivia-team-name')
      const savedTeamId = localStorage.getItem('trivia-team-id')
      if (savedName) connection.emit('team:join', { name: savedName, teamId: savedTeamId })
    })
    connection.on('team:joined', ({ name, teamId: confirmedTeamId }) => {
      setJoinedTeam(name)
      setTeamId(confirmedTeamId)
      localStorage.setItem('trivia-team-name', name)
      localStorage.setItem('trivia-team-id', confirmedTeamId)
    })
    connection.on('team:error', setJoinError)
    setSocket(connection)
    return () => connection.disconnect()
  }, [])

  function joinTeam(event) {
    event.preventDefault()
    if (teamName.trim()) socket?.emit('team:join', { name: teamName, teamId })
  }

  function buzz() {
    socket?.emit('buzzer:tap')
  }

  if (!joinedTeam) return <main className="phone-shell"><div className="phone-card"><div className="brand"><span className="brand-mark"><Sparkles size={16} /></span> Trivia</div><p className="eyebrow">Join the game</p><h1>Choose your team</h1><p>Enter a name, then keep this screen ready. The first team to tap wins.</p><form onSubmit={joinTeam}><input value={teamName} onChange={(event) => { setTeamName(event.target.value); setJoinError('') }} placeholder="Team name" maxLength={24} autoFocus /><button className="primary-button" type="submit">Join buzzer</button></form>{joinError && <p className="feedback feedback-incorrect">{joinError}</p>}</div></main>

  const hasWon = buzzerState.firstTap?.name === joinedTeam
  return <main className="phone-shell"><div className="phone-card phone-buzzer-card"><div className="phone-brand"><div className="brand"><span className="brand-mark"><Sparkles size={16} /></span> Trivia</div><span>{joinedTeam}</span></div><Scoreboard teams={buzzerState.teams} /><p className="eyebrow">{buzzerState.firstTap ? (buzzerState.firstTap.attempt > 1 ? 'Second team answering' : 'Buzzer locked') : buzzerState.buzzerOpen ? 'Your team is ready' : 'Waiting for the host'}</p><h1>{buzzerState.firstTap ? (hasWon ? 'You were first!' : `${buzzerState.firstTap.name} was ${buzzerState.firstTap.attempt > 1 ? 'second' : 'first'}`) : buzzerState.buzzerOpen ? 'Tap when you know it' : 'Listen to the question'}</h1><button className={`buzzer-button ${buzzerState.firstTap || !buzzerState.buzzerOpen ? 'buzzer-locked' : ''}`} onClick={buzz} disabled={Boolean(buzzerState.firstTap) || !buzzerState.buzzerOpen} aria-label="Buzz in"><span>BUZZ</span><small>{buzzerState.firstTap ? 'Wait for the next round' : buzzerState.buzzerOpen ? 'Tap once' : 'Wait for the host'}</small></button>{buzzerState.firstTap && <p className={hasWon ? 'feedback feedback-correct' : 'feedback feedback-incorrect'}>{hasWon ? 'Your team gets to answer.' : 'Stay ready for the next question.'}</p>}</div></main>
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
