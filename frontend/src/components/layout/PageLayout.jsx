import Header from './Header'
import BottomNav from './BottomNav'

export default function PageLayout({ 
  children, 
  title = 'MedVision AI', 
  showBottomNav = true,
  showProfile = true 
}) {
  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col">
      <Header title={title} showProfile={showProfile} />
      <main className="flex-1 pt-20 pb-24 px-md mx-auto w-full max-w-container bg-surface">
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  )
}
