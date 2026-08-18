import Header from './Header'
import BottomNav from './BottomNav'
import DesktopSidebar from './DesktopSidebar'

export default function PageLayout({ 
  children, 
  title = 'MedVision AI', 
  showBottomNav = true,
  showProfile = true,
  showBack = false,
  onBackClick
}) {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex">
      <DesktopSidebar />
      <div className="flex-1 flex flex-col md:ml-56">
        <Header title={title} showProfile={showProfile} showBack={showBack} onBackClick={onBackClick} />
        <main className="flex-1 pt-14 pb-16 md:pb-6 px-md mx-auto w-full max-w-screen-xl bg-surface">
          {children}
        </main>
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  )
}
