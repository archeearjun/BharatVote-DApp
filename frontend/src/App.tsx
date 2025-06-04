import Admin from "./Admin";
import Candidates from "./Candidates";
import Voter from "./Voter";

function App() {
  return (
    <>
      <h1 style={{ textAlign: "center" }}>BharatVote Admin Panel</h1>
      <Admin />
      <hr />
      <Voter />
      <Candidates />
    </>
  );
}

export default App;
