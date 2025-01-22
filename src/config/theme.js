import {createTheme} from "@mui/material"
import {green, grey, indigo} from '@mui/material/colors'

let Theme = createTheme({
    pelette: {
        primary: {
            main: indigo[500],
            normal: indigo['A700']
        },
        secondary: {
            main: indigo[50]
        },
        neutral:{
            light: grey[50],
            
        }
    }
})
