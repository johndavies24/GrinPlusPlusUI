import React from "react";
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Fab from '@material-ui/core/Fab'
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import ButtonAppNav from '../ButtonAppNav';
import WalletTabs from '../WalletTabs'
import StatusBar from '../StatusBar'
import {ipcRenderer} from 'electron';
import Typography from '@material-ui/core/Typography';
import SendModal from '../../components/Modals/SendModal';
import IconButton from '@material-ui/core/IconButton';
import SendIcon from "@material-ui/icons/CallMade";
import ReceiveIcon from '@material-ui/icons/CallReceived';
import FinalizeIcon from '@material-ui/icons/CallMerge';
import RefreshIcon from '@material-ui/icons/Refresh';
import CancelIcon from '@material-ui/icons/Cancel';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import green from '@material-ui/core/colors/green';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

const styles = theme => ({
  fullWidth: {
    width: '100%',
  },
  root: {
    flexGrow: 1,
  },
  actionIcon: {
    padding: 2 * theme.spacing.unit,
    textAlign: 'center'
  },
  send: {
    padding: theme.spacing.unit,
    textAlign: 'left',
  },
  receive: {
    padding: theme.spacing.unit,
    textAlign: 'right',
  }
});

function Peers(props) {
    const [refreshPeers, setRefreshPeers] = React.useState(false);

    console.log("Refresh: " + refreshPeers);

    /*const greenTheme = createMuiTheme({ palette: { primary: green } })

    function getActionIcon(txnId, status) {
      if (status == "Sent") {
        return (
          <IconButton disabled>
            <SendIcon color='primary'/>
          </IconButton>
        );
      } else if (status == "Received" || status == "Coinbase") {
        return (
          <MuiThemeProvider theme={greenTheme}>
            <IconButton disabled>
              <ReceiveIcon color='primary'/>
            </IconButton>
          </MuiThemeProvider>
        );
      } else if (status == "Canceled") {
        return (
          <IconButton disabled>
            <CancelIcon/>
          </IconButton>
        );
      }
      else {
        return (
          <IconButton onClick={function() { cancelTx(txnId) }}>
            <CancelIcon color='error'/>
          </IconButton>
        );
      }
    }*/

    const { classes } = props;

    var peers = ipcRenderer.sendSync('GetConnectedPeers').peers;
    var peerRows = peers.map(function(peer){
        return (
          <React.Fragment key={peer.addr}>
            <Grid container spacing={8}>
              <Grid item xs={5}>
                <h4>{peer.addr}</h4>
              </Grid>
              <Grid item xs={4}>
                <h4>{peer.user_agent}</h4>
              </Grid>
              <Grid item xs={3}>
                <h4 align="right">
                  {peer.direction}
                </h4>
              </Grid>
            </Grid>
            <Divider variant="fullWidth" />
          </React.Fragment>
        );
    })

    return (
        <React.Fragment>
            <ButtonAppNav pageName='Peers'/>
            <br/>
            <Grid container spacing={8} style={{maxHeight: 'calc(100vh - 120px)', overflow: 'auto'}} className={classes.root}>
               <Grid item xs={2}/>
               <Grid item xs={4}>
                 <h2>Connected Peers</h2>
               </Grid>
               <Grid item xs={4}>
                 <div align='right'>
                   <br/>
                   <Button onClick={function(){setRefreshPeers(!refreshPeers)}}>
                     <RefreshIcon/> Refresh
                   </Button>
                 </div>
               </Grid>
               <Grid item xs={2}>
               </Grid>

               <Grid item xs={2}/>
               <Grid item xs={8}>
                 <Divider variant="fullWidth" />
                 {peerRows}
               </Grid>
               <Grid item xs={2}>
               </Grid>
            </Grid>
            <StatusBar/>
        </React.Fragment>
    );
}

Peers.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Peers);