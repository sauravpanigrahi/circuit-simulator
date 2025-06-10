import styled from "styled-components"
import CircuitCanvas from "./components/CircuitCanvas";
import {ContextProvider} from "./contextApi/MyContext"

const Container = styled.div`
  min-height: 100vh;
  min-width: 100vw;
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
   background: linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), 
              url("https://images.unsplash.com/photo-1603732551681-2e91159b9dc2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80") center; 
  background-size: cover;
  overflow: hidden;
              

`

// const Title = styled.h1`
//   font-size: 96px;
//   font-family: 'Roboto', sans-serif;
// `


function App() {
  return (
    <ContextProvider> 
      <Container>
        {/* <Title>SPARKCIRCUITRY</Title> */}
        <CircuitCanvas/>
      </Container>
    </ContextProvider>
  );
}

export default App;
