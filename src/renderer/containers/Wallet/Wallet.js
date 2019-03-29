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

function Wallet(props) {
    const [refresh, setRefresh] = React.useState(false);
    const [showSendModal, setShowSendModal] = React.useState(false);

    console.log("Refresh: " + refresh);

    function FormatAmount(amount) {
      var calculatedAmount = Math.abs(amount) / Math.pow(10, 9);
      var formatted = calculatedAmount.toFixed(9) + "ツ";
      if (amount < 0) {
        formatted = "-" + formatted;
      }

      return formatted;
    }

    function handleSend(event) {
      setShowSendModal(true);
    }

    function handleCloseSendModal(event) {
      setShowSendModal(false);
    }

    function handleReceive(event) {
      ipcRenderer.removeAllListeners('SlateReceived');
      ipcRenderer.on('SlateReceived', (event, fileName, data) => {
        if (data !== null) {
          var result = ipcRenderer.sendSync('Receive', data);
          if (result !== null && result.status_code == 200) {
            ipcRenderer.send('SaveToFile', (fileName + '.response'), JSON.stringify(result.slate));
            setRefresh(!refresh);
          } else {
            // TODO: Handle this
          }
        }
      });

      ipcRenderer.send('ReceiveFile');
    }

    function handleFinalize(event) {
      ipcRenderer.removeAllListeners('SlateReceived');
      ipcRenderer.on('SlateReceived', (event, fileName, data) => {
        if (data !== null) {
          var result = ipcRenderer.sendSync('Finalize', data);
          if (result !== null && result.status_code == 200) {
            console.log(result);
            ipcRenderer.send('SaveToFile', (fileName + '.finalized'), JSON.stringify(result.tx));
            // TODO: PostTx?
            setRefresh(!refresh);
          } else {
            // TODO: Handle this
          }
        }
      });

      ipcRenderer.send('ReceiveFile');
    }

    function cancelTx(txnId) {
      ipcRenderer.sendSync('Cancel', txnId); // TODO: Handle result
      setRefresh(!refresh);
    }

    function repostTx(txnId) {
      ipcRenderer.sendSync('Repost', txnId); // TODO: Handle result
      setRefresh(!refresh);
    }

    const greenTheme = createMuiTheme({ palette: { primary: green } })

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
      } else if (status == "Sending (Finalized)") {
        return (
          <IconButton onClick={function() { repostTx(txnId) }}>
            <RefreshIcon />
          </IconButton>
        );
      } else {
        return (
          <IconButton onClick={function() { cancelTx(txnId) }}>
            <CancelIcon color='error'/>
          </IconButton>
        );
      }
    }

    const { classes } = props;

    // TODO: Add Transactions to WalletSummary to avoid multiple sendSyncs. Also, use async calls
    var result = ipcRenderer.sendSync('WalletSummary');
    var total = FormatAmount(result['total']);
    var amount_awaiting_confirmation = FormatAmount(result['amount_awaiting_confirmation']);
    var amount_immature = FormatAmount(result['amount_immature']);
    var amount_locked = FormatAmount(result['amount_locked']);
    var amount_currently_spendable = FormatAmount(result['amount_currently_spendable']);

    var txns = ipcRenderer.sendSync('RetrieveTransactions').transactions;
    var transactions = txns.map(function(txn){
        return (
          <React.Fragment key={txn.id}>
            <Grid container spacing={8}>
              <Grid item xs={5}>
                <h4>{txn.status}</h4>
                <p>{txn.date_time}</p>
              </Grid>
              <Grid item xs={4}>
              </Grid>
              <Grid item xs={3}>
                <h4 align="right">
                  {FormatAmount(txn.amount)}
                  {getActionIcon(txn.id, txn.status)}
                </h4>
              </Grid>
            </Grid>
            <Divider variant="fullWidth" />
          </React.Fragment>
        );
    })

    return (
        <React.Fragment>
            <ButtonAppNav pageName='Wallet'/>
            <br/>
            <Grid container spacing={8} style={{maxHeight: 'calc(100vh - 120px)', overflow: 'auto'}} className={classes.root}>

               <Grid item xs={2}/>
               <Grid item xs={4}>
                 <br/>
                 <Typography variant="h6">Spendable</Typography>
                 <Typography variant="h4">{amount_currently_spendable}</Typography>
               </Grid>
               <Grid item xs={4}>
                   <br/>
                   <Typography align="right" variant="subtitle2">
                     Total:  {total}<br/>
                     Immature:  {amount_immature}<br/>
                     Unconfirmed:  {amount_awaiting_confirmation}<br/>
                     Locked:  {amount_locked}<br/>
                   </Typography>
               </Grid>
               <Grid item xs={2}/>

               <Grid item xs={3}/>
               <Grid item xs={2}>
                 <Fab
                   variant="extended"
                   className={classes.fullWidth}
                   aria-label="Send"
                   onClick={handleSend}
                   color="primary"
                 >
                   <SendIcon className={classes.extendedIcon}/> Send
                 </Fab>
                 <SendModal showModal={showSendModal} onClose={handleCloseSendModal}/>
               </Grid>
               <Grid item xs={2}>
                 <Fab
                   variant="extended"
                   className={classes.fullWidth}
                   aria-label="Receive"
                   onClick={handleReceive}
                   color="primary"
                 >
                   <ReceiveIcon className={classes.extendedIcon}/> Receive
                 </Fab>
               </Grid>
               <Grid item xs={2}>
                 <Fab
                   variant="extended"
                   className={classes.fullWidth}
                   aria-label="Finalize"
                   onClick={handleFinalize}
                   color="primary"
                 >
                   <FinalizeIcon className={classes.extendedIcon}/> Finalize
                 </Fab>
               </Grid>
               <Grid item xs={3}/>

               <Grid item xs={2}/>
               <Grid item xs={4}>
                 <h2>Transactions</h2>
               </Grid>

               <Grid item xs={4}>
                 <div align='right'>
                   <br/>
                   <Button onClick={function(){setRefresh(!refresh)}}>
                     <RefreshIcon/> Refresh
                   </Button>
                 </div>
               </Grid>
               <Grid item xs={2}>
               </Grid>

               <Grid item xs={2}/>
               <Grid item xs={8}>
                 <Divider variant="fullWidth" />
                 {transactions}
               </Grid>
               <Grid item xs={2}>
               </Grid>
            </Grid>
            <StatusBar/>
        </React.Fragment>
    );
}

Wallet.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Wallet);