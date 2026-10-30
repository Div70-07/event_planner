import { useState, useCallback, useEffect } from 'react';

/**
 * Timeline — vertical milestone timeline with tickable tasks.
 * Panic mode tasks are highlighted if panicMode.enabled.
 * Task state persists in localStorage under event_planner_checklist_tasks.
 */

const LS_KEY = 'event_planner_checklist_tasks';

function loadChecked() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveChecked(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

function getPanicSet(panicMode) {
  if (!panicMode?.enabled) { return new Set(); }
  return new Set([
    ...(panicMode.bookToday ?? []),
    ...(panicMode.doThisWeek ?? []),
    ...(panicMode.canSkip ?? []),
  ]);
}

export default function Timeline({ timeline, panicMode, isCompressed }) {
  const [checked, setChecked] = useState(loadChecked);
  const panicSet = getPanicSet(panicMode);

  useEffect(() => {
    saveChecked(checked);
  }, [checked]);

  const toggleTask = useCallback((taskKey) => {
    setChecked((prev) => ({ ...prev, [taskKey]: !prev[taskKey] }));
  }, []);

  const totalTasks = timeline.reduce((s, m) => s + m.tasks.length, 0);
  const doneTasks = timeline.reduce(
    (s, m) => s + m.tasks.filter((t) => checked[`${m.label}::${t}`]).length,
    0,
  );
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <section className="dashboard-section" aria-labelledby="timeline-heading">
      <div className="section-header">
        <span className="section-icon" aria-hidden="true">📅</span>
        <h2 id="timeline-heading" className="section-title">
          Planning Timeline
          {isCompressed && (
            <span className="compressed-badge" aria-label="Compressed timeline — event is soon">
              ⚡ Compressed
            </span>
          )}
        </h2>
      </div>

      {/* Progress Bar */}
      <div className="progress-wrap" role="group" aria-label="Task completion progress">
        <div className="progress-label">
          <span>{doneTasks}/{totalTasks} tasks done</span>
          <span className="progress-pct">{progressPct}%</span>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Panic Mode Alert */}
      {panicMode?.enabled && (
        <div className="panic-banner" role="alert">
          <span className="panic-icon" aria-hidden="true">🚨</span>
          <div className="panic-content">
            <strong>Panic Mode Active — Event is very soon!</strong>
            {panicMode.bookToday?.length > 0 && (
              <div className="panic-group">
                <h4 className="panic-group-title">Book TODAY</h4>
                <ul className="panic-list">
                  {panicMode.bookToday.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {panicMode.doThisWeek?.length > 0 && (
              <div className="panic-group">
                <h4 className="panic-group-title">Do This Week</h4>
                <ul className="panic-list">
                  {panicMode.doThisWeek.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {panicMode.canSkip?.length > 0 && (
              <div className="panic-group">
                <h4 className="panic-group-title">Can Skip / Defer</h4>
                <ul className="panic-list panic-list--skip">
                  {panicMode.canSkip.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Milestone Timeline */}
      <ol className="timeline-list" aria-label="Event planning milestones">
        {timeline.map((milestone, mIdx) => (
          <li
            key={mIdx}
            className="timeline-milestone"
            aria-label={`Milestone: ${milestone.label}`}
          >
            {/* Milestone Header */}
            <div className="milestone-header">
              <div className="milestone-dot" aria-hidden="true" />
              <div className="milestone-meta">
                <h3 className="milestone-label">{milestone.label}</h3>
                <div className="milestone-dates">
                  <time dateTime={milestone.dueDate} className="milestone-date">
                    {new Date(milestone.dueDate + 'T00:00:00').toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </time>
                  <span className="milestone-relative">· {milestone.relativeLabel}</span>
                </div>
              </div>
            </div>

            {/* Tasks */}
            <ul className="task-list" role="list">
              {milestone.tasks.map((task, tIdx) => {
                const taskKey = `${milestone.label}::${task}`;
                const isChecked = !!checked[taskKey];
                const isPanic = panicSet.has(task);
                return (
                  <li
                    key={tIdx}
                    className={`task-item ${isPanic ? 'task-item--panic' : ''} ${isChecked ? 'task-item--done' : ''}`}
                  >
                    <label className="task-label">
                      <input
                        type="checkbox"
                        className="task-checkbox"
                        checked={isChecked}
                        onChange={() => toggleTask(taskKey)}
                        aria-label={task}
                      />
                      <span className="task-text">{task}</span>
                      {isPanic && (
                        <span className="panic-pill" aria-label="Urgent">🚨</span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
