import { Button, Stack, Typography } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import React from 'react'

const MuiTypo = () => {
  return (
    <Stack>
      Material ui typography
      <Typography variant='h1'>h1 heading</Typography>
      <Typography variant='h2'>h2 heading</Typography>
      <Typography variant='h3'>h3 heading</Typography>
      <Typography variant='h4'>h4 heading</Typography>
      <Typography variant='subtitle1' gutterBottom>h5 heading</Typography>
      <Typography variant='subtitle2'>h6 heading</Typography>
      <Typography variant='subtitle1'>h5 heading</Typography>
      <Typography variant='subtitle2'>h6 heading</Typography>
      <Typography variant='body1'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Necessitatibus.</Typography>
      <Typography variant='body2' gutterBottom>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident accusantium ratione doloremque reprehenderit praesentium corporis ut architecto aut porro dignissimos!</Typography>
   
   <Stack spacing={2} direction='row'>
   <Button variant='text'href='https://google.com'>text </Button>
   <Button variant='contained' size='large'>login</Button>
   <Button variant='outlined'>cancel </Button>
   </Stack>

   <SendIcon></SendIcon>
   

   
   </Stack>
  )
}

export default MuiTypo

