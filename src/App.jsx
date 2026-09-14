import { Routes, Route, Navigate } from 'react-router-dom'
import { LandingScreen } from './marketing/LandingScreen.jsx'
import { MemberLayout } from './member/MemberLayout.jsx'
import { HomeScreen } from './member/HomeScreen.jsx'
import { ChurchProfileScreen } from './member/ChurchProfileScreen.jsx'
import { WriteReviewScreen } from './member/WriteReviewScreen.jsx'
import { FeedScreen } from './member/FeedScreen.jsx'
import { MapScreen } from './member/MapScreen.jsx'
import { SignupScreen } from './member/SignupScreen.jsx'
import { AccountScreen } from './member/AccountScreen.jsx'
import { LoginScreen } from './member/LoginScreen.jsx'

import { AskLayout } from './ask/AskLayout.jsx'
import { AskFeedScreen } from './ask/AskFeedScreen.jsx'
import { AskSearchScreen } from './ask/AskSearchScreen.jsx'
import { AskComposerScreen } from './ask/AskComposerScreen.jsx'
import { QuestionDetailScreen } from './ask/QuestionDetailScreen.jsx'
import { ModeratorApplyScreen } from './ask/ModeratorApplyScreen.jsx'

import { AdminLayout } from './church-admin/AdminLayout.jsx'
import { DashboardScreen } from './church-admin/DashboardScreen.jsx'
import { AdminReviewsScreen } from './church-admin/AdminReviewsScreen.jsx'
import { ProfileScreen } from './church-admin/ProfileScreen.jsx'
import { SermonsScreen } from './church-admin/SermonsScreen.jsx'
import { PromoteScreen } from './church-admin/PromoteScreen.jsx'
import { InsightsScreen } from './church-admin/InsightsScreen.jsx'
import { TeamScreen } from './church-admin/TeamScreen.jsx'
import { BillingScreen } from './church-admin/BillingScreen.jsx'
import { VerifyScreen } from './church-admin/VerifyScreen.jsx'
import { UpgradeScreen } from './church-admin/UpgradeScreen.jsx'

import { StaffLayout } from './staff/StaffLayout.jsx'
import { QueueScreen } from './staff/QueueScreen.jsx'
import { FlagsScreen } from './staff/FlagsScreen.jsx'
import { ClaimsScreen } from './staff/ClaimsScreen.jsx'
import { PromosScreen } from './staff/PromosScreen.jsx'
import { ChurchesScreen } from './staff/ChurchesScreen.jsx'
import { MembersScreen } from './staff/MembersScreen.jsx'
import { StaffBillingScreen } from './staff/StaffBillingScreen.jsx'
import { PolicyScreen } from './staff/PolicyScreen.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<LandingScreen />} />

      {/* Ask is the primary experience now — questions about God, answered on
          video. Church-finder (the app's original purpose) lives at /churches
          as a secondary feature with its own calmer, classical look. */}
      <Route path="/" element={<AskLayout />}>
        <Route index element={<AskFeedScreen />} />
        <Route path="search" element={<AskSearchScreen />} />
        <Route path="ask" element={<AskComposerScreen />} />
        <Route path="question/:id" element={<QuestionDetailScreen />} />
        <Route path="account" element={<AccountScreen />} />
        <Route path="moderate/apply" element={<ModeratorApplyScreen />} />
      </Route>

      <Route path="/churches" element={<MemberLayout />}>
        <Route index element={<HomeScreen />} />
        <Route path="church/:slug" element={<ChurchProfileScreen />} />
        <Route path="write" element={<WriteReviewScreen />} />
        <Route path="feed" element={<FeedScreen />} />
        <Route path="map" element={<MapScreen />} />
        <Route path="signup" element={<SignupScreen />} />
        <Route path="account" element={<AccountScreen />} />
        <Route path="login" element={<LoginScreen />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardScreen />} />
        <Route path="reviews" element={<AdminReviewsScreen />} />
        <Route path="profile" element={<ProfileScreen />} />
        <Route path="sermons" element={<SermonsScreen />} />
        <Route path="promote" element={<PromoteScreen />} />
        <Route path="insights" element={<InsightsScreen />} />
        <Route path="team" element={<TeamScreen />} />
        <Route path="billing" element={<BillingScreen />} />
        <Route path="verify" element={<VerifyScreen />} />
        <Route path="upgrade" element={<UpgradeScreen />} />
      </Route>

      <Route path="/staff" element={<StaffLayout />}>
        <Route index element={<QueueScreen />} />
        <Route path="flags" element={<FlagsScreen />} />
        <Route path="claims" element={<ClaimsScreen />} />
        <Route path="promos" element={<PromosScreen />} />
        <Route path="churches" element={<ChurchesScreen />} />
        <Route path="members" element={<MembersScreen />} />
        <Route path="billing" element={<StaffBillingScreen />} />
        <Route path="policy" element={<PolicyScreen />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
