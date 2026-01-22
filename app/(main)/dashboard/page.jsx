import CreateInterview from "./_components/CreateInterview";
import LatestInterviewsList from "./_components/LatestInterviewsList";
import WelcomeContainer from "./_components/WelcomeContainer";

function Dashboard() {
  return (
    <div>
      <WelcomeContainer />
      <h2 className="mt-6 mb-2 font-bold text-2xl">Dashboard</h2>
      <CreateInterview />
      <LatestInterviewsList />
    </div>
  );
}

export default Dashboard;
