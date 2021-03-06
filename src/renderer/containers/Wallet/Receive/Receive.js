import React from "react";
import PropTypes from "prop-types";
import { ipcRenderer, clipboard } from 'electron';
import {
    Button, Divider, Grid, Radio, RadioGroup,
    FormControl, FormControlLabel, IconButton, Typography
} from "@material-ui/core";
import ReceiveIcon from "@material-ui/icons/CallReceived";
import OpenIcon from '@material-ui/icons/FolderOpen';
import CopyIcon from '@material-ui/icons/FileCopy';
import { withStyles } from "@material-ui/core/styles";
import CustomTextField from "../../../components/CustomTextField";

const styles = theme => ({
    fab: {
        margin: theme.spacing(1)
    },
    fileChooserButton: {
        marginTop: theme.spacing(1),
        marginLeft: theme.spacing(1),
        padding: '5px'
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1)
    },
    extendedIcon: {
        marginRight: theme.spacing(1)
    },
    outlineText: {
        textShadow: '-1px 0 red, 0 1px red, 1px 0 red, 0 -1px red'
        //-webkit-text-stroke-width: '1px',
        //-webkit-text-stroke-color: 'black'
    }
});

function Receive(props) {
    const { classes } = props;
    const [selectedFile, setSelectedFile] = React.useState("");
    const [httpAddress, setHttpAddress] = React.useState("");
    const [addressType, setAddressType] = React.useState("IP");
    const [grinboxAddress, setGrinboxAddress] = React.useState("");
    const [torAddress, setTorAddress] = React.useState("");
    const [message, setMessage] = React.useState("");

    if (httpAddress.length === 0) {
        setTimeout(() => {
            const http = ipcRenderer.sendSync('LookupURL');
            if (http.ngrok != null && http.ngrok.length > 0) {
                // TODO: Show expiration
                setHttpAddress(http.ngrok);
                setAddressType("NGROK");
            } else {
                setHttpAddress("http://" + http.IP + ":3415");
                setAddressType("IP");
            }

            const grinboxAddress = ipcRenderer.sendSync('Grinbox::GetAddress');
            if (grinboxAddress != null) {
                setGrinboxAddress(grinboxAddress);
            }

            const torAddress = ipcRenderer.sendSync('Tor::GetAddress');
            if (torAddress != null) {
                setTorAddress(torAddress);
            }
        }, 25);
    }
    
    function closeModal() {
        setHttpAddress("");
        setSelectedFile("");
        setMessage("");
    }

    function handleReceive(_event) {
        ipcRenderer.removeAllListeners('SlateOpened');
        ipcRenderer.on('SlateOpened', (event, fileName, data) => {
            if (data !== null) {
                var result = ipcRenderer.sendSync('Receive', data, selectedFile, message);
                if (result !== null) {
                    if (result.status_code == 200) {
                        ipcRenderer.send('SaveToFile', (fileName + '.response'), JSON.stringify(result.slate));
                        ipcRenderer.send('Snackbar::Relay', "SUCCESS", "Saving response slate to: " + fileName + ".response");
                        closeModal();
                    } else {
                        ipcRenderer.send('Snackbar::Relay', "ERROR", "Receive failed with status code: " + result.status_code);
                    }
                } else {
                    ipcRenderer.send('Snackbar::Relay', "ERROR", "Unknown error occurred!");
                }
            }
        });

        ipcRenderer.send('OpenSlateFile', selectedFile);
    }

    function handleSelectFile(_event) {
        ipcRenderer.removeAllListeners('ReceiveFileSelected');
        ipcRenderer.on('ReceiveFileSelected', (event, file) => {
            if (file !== null) {
                setSelectedFile(file);
            } else {
                setSelectedFile("");
            }
        });

        ipcRenderer.send('ReceiveFile');
    }

    function getWarning() {
        if (addressType == "IP") {
            return (
                <b>
                    Advanced users only! You must configure port forwarding on port 3415 for this to work.<br />
                    After requesting funds via http, you must leave Grin++ logged in until those funds are recevied.
                </b>
            );
        } else if (addressType == "NGROK") {
            return (
                <b>
                    Ngrok addresses are ephemeral, and a new one is generated each time you open Grin++.<br />
                    After requesting funds via https, you must stay logged in until those funds are received.
                </b>
            );
        } else {
            return (
                <b>FAILED TO RETRIEVE ADDRESS</b>
            );
        }
    }

    function getGrinboxDisplay() {
        if (grinboxAddress.length == 0) {
            return (
                <b>ERROR CONNECTING TO GRINBOX</b>
            );
        }
        else {
            return (
                <React.Fragment>
                    <b>{grinboxAddress}</b>
                    <IconButton onClick={() => { clipboard.writeText(grinboxAddress) }} style={{ padding: '5px' }}>
                        <CopyIcon fontSize='small' color='secondary' />
                    </IconButton>
                </React.Fragment>
            );
        }
    }

    function getTorDisplay() {
        if (torAddress.length == 0) {
            return "";
        }
        else {
            return (
                <React.Fragment>
                    <Typography variant='body1' display='inline' color='primary' style={{ marginRight: '10px' }}>
                        <b>TOR:</b>
                    </Typography>
                    <Typography variant='body1' display='inline' color='secondary'>
                        <b>{torAddress}</b>
                        <IconButton onClick={() => { clipboard.writeText(torAddress) }} style={{ padding: '5px' }}>
                            <CopyIcon fontSize='small' color='secondary' />
                        </IconButton>
                    </Typography>
                </React.Fragment>
            );
        }
    }

    return (
        <React.Fragment>
            <form className={classes.form} onSubmit={handleReceive}>
                <center>
                    {/* ReceiveHTTP */}
                    <p style={{ fontSize: '15px', color: 'white' }} className={classes.outlineText}>
                        {getWarning()}
                    </p>

                    <Typography variant='body1' color='secondary'>
                        <b>{httpAddress}</b>

                        <IconButton onClick={() => { clipboard.writeText(httpAddress)}} style={{ padding: '5px' }}>
                            <CopyIcon fontSize='small' color='secondary' />
                        </IconButton>
                    </Typography>

                    <br />
                    <Divider variant="fullWidth" /><br />

                    <Typography variant='body1' display='inline' color='primary' style={{ marginRight: '10px' }}>
                        <b>GRINBOX:</b>
                    </Typography>
                    <Typography variant='body1' display='inline' color='secondary'>
                        {getGrinboxDisplay()}
                    </Typography>

                    {getTorDisplay()}

                    {/* ReceiveFile */}
                    <br /><br /><Divider variant="fullWidth" /><br />

                    <div>
                        <FormControl
                            margin="dense"
                            required
                            fullWidth
                            style={{ width: `calc(100% - 50px)` }}
                        >
                            <CustomTextField
                                name="receiveFile"
                                type="text"
                                id="receiveFile"
                                value={selectedFile}
                                placeholder='Transaction File'
                            />
                        </FormControl>
                        <IconButton color='secondary' onClick={handleSelectFile} className={classes.fileChooserButton}>
                            <OpenIcon />
                        </IconButton>
                    </div>
                    <div>
                        <FormControl margin="dense" fullWidth>
                            <CustomTextField name="message" type="text" id="message" value={message} onChange={(e) => { setMessage(e.target.value); }} placeholder='Message' />
                        </FormControl>
                    </div>
                    <br />
                </center>
                <Typography align='right'>
                    <Button type="submit" style={{ marginLeft: '10px' }} disabled={ selectedFile.length == 0 } variant="contained" color="primary">
                        Receive <ReceiveIcon />
                    </Button>
                </Typography>
            </form>
        </React.Fragment>
    );
}

Receive.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Receive);
