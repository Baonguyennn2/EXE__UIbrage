import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    studio: '',
    password: '',
    confirmPassword: '',
  })

  function setField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <main className="auth-page">
      <section className="auth-page__card auth-page__card--register">
        <header>
          <p className="eyebrow">Create account</p>
          <h1>Join UIbrage Marketplace</h1>
          <p>
            Build your creator profile to publish, sell, and manage premium game UI assets.
          </p>
        </header>

        <form className="auth-page__form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input type="text" value={form.fullName} onChange={setField('fullName')} placeholder="Nguyen Van A" />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={setField('email')} placeholder="you@studio.com" />
          </label>
          <label>
            Studio / Brand
            <input type="text" value={form.studio} onChange={setField('studio')} placeholder="Skyline Interactive" />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={setField('password')} placeholder="Create password" />
          </label>
          <label>
            Confirm password
            <input type="password" value={form.confirmPassword} onChange={setField('confirmPassword')} placeholder="Repeat password" />
          </label>

          <label className="auth-page__checkbox">
            <input type="checkbox" defaultChecked />
            I agree to Terms of Service and Privacy Policy.
          </label>

          <button type="submit" className="market-primary-button auth-page__submit">Create account</button>
        </form>

        <footer>
          Already have an account? <Link to="/auth/login">Log in</Link>
        </footer>
      </section>
    </main>
  )
}
