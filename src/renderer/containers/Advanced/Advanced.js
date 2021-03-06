import React from "react";
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import {ipcRenderer} from 'electron';
import RefreshIcon from '@material-ui/icons/Refresh';

const styles = theme => ({
    fullWidth: {
        width: '100%',
    },
    root: {
        flexGrow: 1,
    },
    actionIcon: {
        padding: theme.spacing(2),
        textAlign: 'center'
    },
    send: {
        padding: theme.spacing(1),
        textAlign: 'left',
    },
    receive: {
        padding: theme.spacing(1),
        textAlign: 'right',
    }
});

function Advanced(props) {
    const [refreshPeers, setRefreshPeers] = React.useState(false);

    const { classes } = props;

    return (
        <React.Fragment>
            <br />
            {/* CONSOLE */}
        </React.Fragment>
    );
}

Advanced.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Advanced);
