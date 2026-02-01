import CreateInterview from "./_components/CreateInterview";
import LatestInterviewsList from "./_components/LatestInterviewsList";
import WelcomeContainer from "./_components/WelcomeContainer";

function Dashboard() {
  return (
    <div className="space-y-6">
      <WelcomeContainer />
      <CreateInterview />
      <LatestInterviewsList />
    </div>
  );
}

export default Dashboard;
