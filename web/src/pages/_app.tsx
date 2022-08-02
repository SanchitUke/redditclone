import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react';
import theme from '../theme';



function MyApp({ Component, pageProps } : any) {
  return (
      <ChakraProvider theme={theme}>
        <ColorModeProvider
          options={{
            useSystemColorMode: true,
          }}
        >
          <Component {...pageProps} />
        </ColorModeProvider>
      </ChakraProvider>
  )
}

export default MyApp
