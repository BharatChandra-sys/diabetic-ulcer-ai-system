import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PageLayout from '../components/layout/PageLayout'
import Button from '../components/ui/Button'

export default function AccountSettings() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)

  const [profile, setProfile] = useState({
    name: user?.displayName || '',
    age: '',
    diabetesType: 'Type 2',
    duration: '12 Years'
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save profile data to backend
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setEditMode(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <PageLayout title="Profile" activeNav="profile">
      <div className="flex flex-col w-full min-h-full gap-lg pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mt-md">
          <h1 className="font-headline text-headline-xl-mobile text-on-surface">
            My Health Profile
          </h1>
          <button
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-xs px-sm py-2 rounded-full border border-outline-variant text-on-surface hover:bg-surface-variant transition-colors min-h-[48px]"
          >
            <span className="material-symbols-outlined text-[20px]">
              {editMode ? 'close' : 'edit'}
            </span>
            <span className="font-label-md text-label-md">{editMode ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>

        {/* Profile Section */}
        <div className="bg-surface-container-low rounded-xl border border-outline-variant p-md">
          <div className="flex items-center gap-md mb-lg">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-2 border-primary bg-primary-container flex items-center justify-center text-on-primary-container overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-headline text-[48px]">
                    {(user?.displayName || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {editMode && (
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                </button>
              )}
            </div>

            {/* Name and Age */}
            <div className="flex flex-col gap-xs flex-1">
              {editMode ? (
                <>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="font-headline text-headline-lg text-on-surface bg-surface rounded-lg border border-outline-variant px-sm py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your Name"
                  />
                  <input
                    type="text"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    className="font-body-lg text-body-lg text-on-surface-variant bg-surface rounded-lg border border-outline-variant px-sm py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Age"
                  />
                </>
              ) : (
                <>
                  <h2 className="font-headline text-headline-lg text-on-surface">
                    {profile.name || user?.displayName || 'User'}
                  </h2>
                  {profile.age && (
                    <p className="font-body-lg text-body-lg text-on-surface-variant">
                      Age: {profile.age}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* About My Diabetes */}
          <div className="flex flex-col gap-md">
            <h3 className="font-headline text-headline-md text-on-surface">About My Diabetes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
              {/* Type */}
              <div className="bg-surface rounded-lg p-sm border border-outline-variant">
                <p className="font-label-md text-label-md text-on-surface-variant mb-1">Type</p>
                {editMode ? (
                  <select
                    value={profile.diabetesType}
                    onChange={(e) => setProfile({ ...profile, diabetesType: e.target.value })}
                    className="font-body-lg text-body-lg text-on-surface bg-transparent focus:outline-none w-full"
                  >
                    <option value="Type 1">Type 1</option>
                    <option value="Type 2">Type 2</option>
                    <option value="Gestational">Gestational</option>
                  </select>
                ) : (
                  <p className="font-body-lg text-body-lg text-on-surface">{profile.diabetesType}</p>
                )}
              </div>

              {/* Duration */}
              <div className="bg-surface rounded-lg p-sm border border-outline-variant">
                <p className="font-label-md text-label-md text-on-surface-variant mb-1">Duration</p>
                {editMode ? (
                  <input
                    type="text"
                    value={profile.duration}
                    onChange={(e) => setProfile({ ...profile, duration: e.target.value })}
                    className="font-body-lg text-body-lg text-on-surface bg-transparent focus:outline-none w-full"
                    placeholder="e.g., 5 Years"
                  />
                ) : (
                  <p className="font-body-lg text-body-lg text-on-surface">{profile.duration}</p>
                )}
              </div>
            </div>

            {editMode && (
              <Button onClick={handleSave} disabled={loading} className="mt-md">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            )}

            {!editMode && (
              <button className="self-start text-primary font-label-md text-label-md hover:underline min-h-[48px] px-2 -ml-2 mt-sm flex items-center">
                I'll fill the rest in later
              </button>
            )}
          </div>
        </div>

        {/* Account Settings */}
        <div className="flex flex-col gap-md">
          <h2 className="font-headline text-headline-lg text-on-surface">Account Settings</h2>
          
          {/* Settings List */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            {/* Email */}
            <div className="flex items-center justify-between p-md border-b border-outline-variant">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-on-surface-variant">email</span>
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md text-on-surface">Email</span>
                  <span className="font-body-sm text-on-surface-variant">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Password */}
            <button className="w-full flex items-center justify-between p-md border-b border-outline-variant hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                <span className="font-body-md text-body-md text-on-surface">
                  Change Password
                </span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">
                chevron_right
              </span>
            </button>

            {/* Notifications */}
            <button className="w-full flex items-center justify-between p-md border-b border-outline-variant hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-on-surface-variant">
                  notifications
                </span>
                <span className="font-body-md text-body-md text-on-surface">Notifications</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">
                chevron_right
              </span>
            </button>

            {/* Privacy */}
            <button className="w-full flex items-center justify-between p-md hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-on-surface-variant">shield</span>
                <span className="font-body-md text-body-md text-on-surface">
                  Privacy & Security
                </span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">
                chevron_right
              </span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="flex flex-col gap-md">
          <h2 className="font-headline text-headline-lg text-on-surface">More Options</h2>
          
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            {/* Help & Support */}
            <button className="w-full flex items-center justify-between p-md border-b border-outline-variant hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-on-surface-variant">help</span>
                <span className="font-body-md text-body-md text-on-surface">
                  Help & Support
                </span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">
                chevron_right
              </span>
            </button>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-between p-md hover:bg-error-container/10 transition-colors"
            >
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-error">logout</span>
                <span className="font-body-md text-body-md text-error">Sign Out</span>
              </div>
            </button>
          </div>
        </div>

        {/* Sticky Bottom CTA */}
        <div className="fixed bottom-20 left-0 right-0 bg-surface/90 backdrop-blur-md p-md border-t border-outline-variant z-40 max-w-[640px] mx-auto pb-safe">
          <button
            onClick={() => navigate('/foot-scan-analysis')}
            className="w-full bg-primary text-on-primary font-headline text-headline-md py-3 rounded-full flex items-center justify-center gap-sm min-h-[56px] hover:bg-on-primary-fixed-variant transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
            Start New Scan
          </button>
        </div>
      </div>
    </PageLayout>
  )
}
