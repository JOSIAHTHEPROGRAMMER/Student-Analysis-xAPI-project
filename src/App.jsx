import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [group, setGroup] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState(null)

  const API_BASE_URL = 'http://localhost:3000'

  // Predefined groups
  const groups = [
    { id: 'group-a', name: 'Group A' },
    { id: 'group-b', name: 'Group B' },
    { id: 'group-c', name: 'Group C' }
  ]

  // Helper to get group activity object
  const getGroupActivity = (groupId) => {
    const group = groups.find(g => g.id === groupId)
    return {
      objectType: "Activity",
      id: `https://quiz.com/groups/${groupId}`,
      definition: {
        name: { "en-US": group ? group.name : groupId },
        description: { "en-US": `Learning group: ${group ? group.name : groupId}` }
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, group })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Login failed')

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const userId = `user_${Date.now()}`

      const userInfo = {
        username,
        email,
        group,
        timestamp: new Date().toISOString(),
        userId: userId,
        sessionId: sessionId
      }

      setUserData(userInfo)
      setIsLoggedIn(true)
      setMessage('Login successful!')

    } catch (error) {
      setMessage('Error: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await sendXAPI('logged-out', {
        username: userData.username,
        email: userData.email,
        userId: userData.userId,
        sessionId: userData.sessionId,
        activity: "Logout",
        activityId: "https://quiz.com/activity/logout",
        activityType: "https://quiz.com/activity-types/session",
        description: "User logged out",
      })
    } catch (e) {  }

    setIsLoggedIn(false)
    setUserData(null)
    setUsername('')
    setPassword('')
    setEmail('')
    setGroup('')
    setMessage('Logged out successfully')
  }

  // Core xAPI sending function
  const sendXAPI = async (verb, data) => {
    const homePage = window.location.origin

    const actor = {
      objectType: "Agent",
      account: {
        homePage: homePage,
        name: data.userId || userData?.userId || data.email || 'anonymous'
      }
    }
    if (data.username) actor.name = data.username

    // Determine verb ID and display
    let verbId, verbDisplay
    if (data.customVerb) {
      verbId = data.verbId
      verbDisplay = { "en-US": data.verbDisplay }
    } else {
      verbId = getVerbId(verb)
      verbDisplay = getVerbDisplay(verb)
    }

    const object = {
      objectType: "Activity",
      id: data.activityId || `https://quiz.com/activity/${data.activity || 'unknown'}`,
      definition: {
        type: data.activityType || "https://quiz.com/activity-types/activity",
        name: { "en-US": data.activity || "Activity" },
        description: { "en-US": data.description || "Learning activity" }
      }
    }

    const context = {
      contextActivities: {},
      extensions: data.extensions || {}
    }

    if (userData?.group) {
      context.contextActivities.grouping = [getGroupActivity(userData.group)]
    }
    if (data.grouping) {
      context.contextActivities.grouping = [data.grouping]
    }

    if (data.parent) context.contextActivities.parent = [data.parent]
    if (data.category) context.contextActivities.category = [data.category]

    if (Object.keys(context.contextActivities).length === 0) delete context.contextActivities

    const xapiStatement = {
      id: uuidv4(),
      actor,
      verb: { id: verbId, display: verbDisplay },
      object,
      context,
      timestamp: new Date().toISOString(),
      version: "1.0.3"
    }

    if (data.result) xapiStatement.result = data.result

    console.log('Sending xAPI statement:', xapiStatement)

    try {
      const response = await fetch(`${API_BASE_URL}/api/xapi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statement: xapiStatement,
          verbType: verb,
          additionalData: data
        })
      })

      if (!response.ok) throw new Error('Failed to send xAPI statement')
      const responseData = await response.json()
      console.log('xAPI statement sent via backend')
      return responseData
    } catch (error) {
      console.error('Failed to send xAPI:', error.message)
      throw error
    }
  }

  const getVerbId = (verb) => {
    const verbMap = {
      'logged-in': 'http://adlnet.gov/expapi/verbs/logged-in',
      'logged-out': 'http://adlnet.gov/expapi/verbs/logged-out',
      'answered': 'http://adlnet.gov/expapi/verbs/answered',
      'selected': 'http://adlnet.gov/expapi/verbs/selected',
      'completed': 'http://adlnet.gov/expapi/verbs/completed',
      'attempted': 'http://adlnet.gov/expapi/verbs/attempted',
      'failed': 'http://adlnet.gov/expapi/verbs/failed',
      'passed': 'http://adlnet.gov/expapi/verbs/passed'
    }
    return verbMap[verb] || 'http://adlnet.gov/expapi/verbs/experienced'
  }

  const getVerbDisplay = (verb) => {
    const displayMap = {
      'logged-in': { "en-US": "logged in" },
      'logged-out': { "en-US": "logged out" },
      'answered': { "en-US": "answered" },
      'selected': { "en-US": "selected" },
      'completed': { "en-US": "completed" },
      'attempted': { "en-US": "attempted" },
      'failed': { "en-US": "failed" },
      'passed': { "en-US": "passed" }
    }
    return displayMap[verb] || { "en-US": "experienced" }
  }

  return (
    <div className="app-container">
      {!isLoggedIn ? (
        <div className="login-container">
          <h1>Login to Learning Platform</h1>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="group">Group:</label>
              <select
                id="group"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                required
              >
                <option value="" disabled>Select your group</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <button type="submit" disabled={isLoading} className="login-button">
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </div>
      ) : (
        <Dashboard
          userData={userData}
          onLogout={handleLogout}
          sendXAPI={sendXAPI}
          groups={groups}
          apiBaseUrl={API_BASE_URL}
        />
      )}
    </div>
  )
}

// Dashboard with tabs
function Dashboard({ userData, onLogout, sendXAPI, groups, apiBaseUrl }) {
  const [activeTab, setActiveTab] = useState('create') // 'create' or 'view'

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="user-info">
          <span>👤 {userData.username}</span>
          <span>✉️ {userData.email}</span>
          <span>👥 {groups.find(g => g.id === userData.group)?.name || userData.group}</span>
        </div>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Statement
        </button>
        <button
          className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          View Statements
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'create' && (
          <StatementBuilder
            userData={userData}
            sendXAPI={sendXAPI}
            groups={groups}
          />
        )}
        {activeTab === 'view' && (
          <StatementsView
            userData={userData}
            apiBaseUrl={apiBaseUrl}
            groups={groups}
          />
        )}
      </div>
    </div>
  )
}

// StatementBuilder component 
function StatementBuilder({ userData, sendXAPI, groups }) {
  const courses = [
    {
      id: 'comp3609',
      name: 'COMP 3609 - Game Programming',
      uri: 'https://example.edu/comp3609',
      description: 'Fundamentals of Game Programming'
    },
  ]

  const verbs = [
    { display: 'Defined', uri: 'https://example.edu/comp3609/xapi/verbs/defined', description: 'The student established the core game idea, objectives, and mechanics.' },
    { display: 'Analyzed', uri: 'https://example.edu/comp3609/xapi/verbs/analyzed', description: 'The student examined and documented project requirements and constraints.' },
    { display: 'Designed', uri: 'https://example.edu/comp3609/xapi/verbs/designed', description: 'The student planned the game structure, screens, levels, and architecture.' },
    { display: 'Modeled', uri: 'https://example.edu/comp3609/xapi/verbs/modeled', description: 'The student created class diagrams or structured object-oriented relationships.' },
    { display: 'Implemented', uri: 'https://example.edu/comp3609/xapi/verbs/implemented', description: 'The student developed a gameplay feature or system in code.' },
    { display: 'Integrated', uri: 'https://example.edu/comp3609/xapi/verbs/integrated', description: 'The student incorporated assets, libraries, or components into the game.' },
    { display: 'Applied', uri: 'https://example.edu/comp3609/xapi/verbs/applied', description: 'The student used a concept, algorithm, or design pattern in the project.' },
    { display: 'Build', uri: 'https://example.edu/comp3609/xapi/verbs/constructed', description: 'The student built a playable level, system, or module.' },
    { display: 'Animate', uri: 'https://example.edu/comp3609/xapi/verbs/animated', description: 'The student implemented frame-based or motion-based animation.' },
    { display: 'Tested', uri: 'https://example.edu/comp3609/xapi/verbs/tested', description: 'The student executed the game to verify functionality and gameplay behavior.' },
    { display: 'Debugged', uri: 'https://example.edu/comp3609/xapi/verbs/debugged', description: 'The student identified and corrected errors or unintended behavior.' },
    { display: 'Optimized', uri: 'https://example.edu/comp3609/xapi/verbs/optimized', description: 'The student improved performance, structure, or resource usage.' }
  ]

  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id || '')
  const [selectedVerb, setSelectedVerb] = useState(verbs[0]?.uri || '')
  const [customDescription, setCustomDescription] = useState('')
  const [statementStatus, setStatementStatus] = useState('')

  const handleSubmitStatement = async (e) => {
    e.preventDefault()
    setStatementStatus('Sending...')

    const verbObj = verbs.find(v => v.uri === selectedVerb)
    if (!verbObj) {
      setStatementStatus('Error: Please select a verb')
      return
    }

    const courseObj = courses.find(c => c.id === selectedCourse)
    if (!courseObj) {
      setStatementStatus('Error: Please select a course')
      return
    }

    try {
      await sendXAPI('custom', {
        customVerb: true,
        verbId: verbObj.uri,
        verbDisplay: verbObj.display,
        username: userData.username,
        email: userData.email,
        userId: userData.userId,
        activity: courseObj.name,
        activityId: `${courseObj.uri}/activity`,
        activityType: 'https://example.edu/activity-types/course',
        description: customDescription || verbObj.description,
      })

      setStatementStatus('Statement sent successfully!')
      setCustomDescription('')
    } catch (error) {
      setStatementStatus('Error sending statement: ' + error.message)
    }
  }

  return (
    <div className="builder-content">
      <h2>Create Your Own xAPI Statement</h2>
      <form onSubmit={handleSubmitStatement} className="statement-form">
        <div className="form-group">
          <label htmlFor="course">Course:</label>
          <select
            id="course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            required
          >
            <option value="" disabled>Select a course</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="verb">Verb:</label>
          <select
            id="verb"
            value={selectedVerb}
            onChange={(e) => setSelectedVerb(e.target.value)}
            required
          >
            <option value="" disabled>Select a verb</option>
            {verbs.map(v => (
              <option key={v.uri} value={v.uri}>{v.display}</option>
            ))}
          </select>
          {selectedVerb && (
            <p className="verb-description">
              {verbs.find(v => v.uri === selectedVerb)?.description}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">Additional Description (optional):</label>
          <textarea
            id="description"
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            placeholder="Add more context about what you did..."
            rows="3"
          />
        </div>

        <button type="submit" className="submit-button">
          Send xAPI Statement
        </button>

        {statementStatus && (
          <div className={`status-message ${statementStatus.includes('✅') ? 'success' : 'error'}`}>
            {statementStatus}
          </div>
        )}
      </form>

      <div className="info-box">
        <h4>About Your Statement</h4>
        <p>
          When you click send, an xAPI statement will be created with:
        </p>
        <ul>
          <li><strong>Actor:</strong> You (identified by your account)</li>
          <li><strong>Verb:</strong> The selected verb from COMP 3609</li>
          <li><strong>Object:</strong> The selected course</li>
          <li><strong>Context:</strong> Your group as the grouping activity</li>
        </ul>
      </div>
    </div>
  )
}

function StatementsView({ userData, apiBaseUrl, groups }) {
  const [statements, setStatements] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchStatements = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${apiBaseUrl}/api/statements?limit=100`)
      if (!response.ok) throw new Error('Failed to fetch statements')
      const data = await response.json()
      setStatements(data.statements || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isRelevantStatement = (statement) => {
    try {
      // Check actor matches current user
      const actorName = statement.actor?.name
      const actorAccountName = statement.actor?.account?.name
      const userAccountName = userData.email
      const userName = userData.username

      const isCurrentUser = 
        (actorName && actorName === userName) ||
        (actorAccountName && actorAccountName === userAccountName)

      if (isCurrentUser) return true

      const grouping = statement.context?.contextActivities?.grouping
      if (grouping && grouping.length > 0) {
        const groupActivity = grouping[0]
        const groupId = groupActivity.id
        const match = groupId.match(/\/groups\/([^/]+)$/)
        if (match && match[1] === userData.group) {
          return true
        }
      }
      return false
    } catch (e) {
      return false
    }
  }

  const filteredStatements = statements.filter(isRelevantStatement)

  // Helper to extract group name
  const extractGroup = (statement) => {
    try {
      const grouping = statement.context?.contextActivities?.grouping
      if (grouping && grouping.length > 0) {
        const groupId = grouping[0].id
        const match = groupId.match(/\/groups\/([^/]+)$/)
        if (match) {
          const groupKey = match[1]
          const group = groups.find(g => g.id === groupKey)
          return group ? group.name : groupKey
        }
        return groupId
      }
    } catch (e) { }
    return 'N/A'
  }

  const extractUser = (statement) => {
    try {
      const actor = statement.actor
      if (actor.name) return actor.name
      if (actor.account?.name) return actor.account.name
      if (actor.mbox) return actor.mbox
      return 'Unknown'
    } catch (e) {
      return 'Unknown'
    }
  }

  const extractVerb = (statement) => {
    try {
      const display = statement.verb.display
      return display?.['en-US'] || display?.['en'] || statement.verb.id || 'Unknown'
    } catch (e) {
      return 'Unknown'
    }
  }

  const extractDescription = (statement) => {
    try {
      const objName = statement.object.definition?.name?.['en-US'] || statement.object.definition?.name?.['en'] || statement.object.id
      const objDesc = statement.object.definition?.description?.['en-US'] || statement.object.definition?.description?.['en']
      const resultDesc = statement.result?.response || statement.result?.success ? 'Success' : ''
      const parts = [objName]
      if (objDesc) parts.push(` - ${objDesc}`)
      if (resultDesc) parts.push(` (${resultDesc})`)
      return parts.join('')
    } catch (e) {
      return statement.object?.id || 'No description'
    }
  }

  // Fetch on mount
  useState(() => {
    fetchStatements()
  }, [])

  return (
    <div className="statements-view">
      <div className="view-header">
        <h2>Statements from Your Group</h2>
        <button onClick={fetchStatements} className="refresh-button" disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="error-message">Error: {error}</div>}

      {loading && <div className="loading">Loading statements...</div>}

      {!loading && filteredStatements.length === 0 && (
        <div className="no-data">No statements found for your group.</div>
      )}

      {!loading && filteredStatements.length > 0 && (
        <table className="statements-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>User</th>
              <th>Verb</th>
              <th>Statement Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredStatements.map((stmt, idx) => (
              <tr key={stmt.id || idx}>
                <td>{extractGroup(stmt)}</td>
                <td>{extractUser(stmt)}</td>
                <td>{extractVerb(stmt)}</td>
                <td>{extractDescription(stmt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App