import { useState, useRef, useEffect } from 'react'

const ICONS = ['🗂️', '🚀', '💻', '🔐', '☁️', '🐳', '⚙️', '📊', '🎯', '📚', '🛠️', '🔧', '🌐', '📡', '🧠', '⚡', '🔥', '✨', '🏆', '🎓']

export default function IconPicker({ value, onChange, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div className="icon-picker" ref={ref}>
      {ICONS.map(icon => (
        <button
          key={icon}
          className={`icon-picker-item ${value === icon ? 'selected' : ''}`}
          onClick={() => { onChange(icon); onClose() }}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
