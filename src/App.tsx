import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import WebsiteLanding from "./pages/WebsiteLanding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WebsiteLanding />
  </QueryClientProvider>
);

export default App;
