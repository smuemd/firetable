import React from "react";
import _groupBy from "lodash/groupBy";
import _find from "lodash/find";
import {
  createStyles,
  makeStyles,
  Container,
  Grid,
  Link,
  Typography,
  Divider,
  Checkbox,
} from "@material-ui/core";
import Favorite from "@material-ui/icons/Favorite";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";
import SecurityIcon from "@material-ui/icons/Security";
import AppBar from "components/AppBar";
import Loading from "components/Loading";
import EmptyState from "components/EmptyState";
import StyledCard from "components/StyledCard";
import CreateTableDialog from "components/CreateTableDialog";
import routes from "constants/routes";
import { useFiretableContext } from "contexts/firetableContext";
import { useAppContext } from "contexts/appContext";
import { DocActions } from "hooks/useDoc";
const useStyles = makeStyles(theme =>
  createStyles({
    root: { minHeight: "100vh", paddingBottom: theme.spacing(8) },
    section: {
      padding: theme.spacing(2),
    },
    greeting: {
      textTransform: "uppercase",
      letterSpacing: 3,
      display: "inline-block",
      verticalAlign: "middle",
    },
    newChip: {
      ...theme.typography.overline,
      backgroundColor: theme.palette.text.secondary,
      color: theme.palette.getContrastText(theme.palette.text.secondary),
      marginLeft: theme.spacing(4),
    },
    newChipLabel: { padding: theme.spacing(0, 2) },
    divider: {
      margin: theme.spacing(2, 0, 2),
    },

    cardGrid: {
      [theme.breakpoints.down("xs")]: { maxWidth: 360, margin: "0 auto" },
    },
    card: {
      height: "100%",
      [theme.breakpoints.up("md")]: { minHeight: 220 },
      [theme.breakpoints.down("md")]: { minHeight: 180 },
    },

    createTableContainer: {
      alignSelf: "flex-end",
      marginLeft: "auto",
    },
    createTableFab: {
      width: 80,
      height: 80,
      borderRadius: theme.shape.borderRadius * 2,
      "& svg": { width: "2em", height: "2em" },
    },
  })
);

const TablesView = () => {
  const classes = useStyles();
  const { sections, createTable, userClaims } = useFiretableContext();
  const { userDoc } = useAppContext();

  const favs = userDoc.state.doc?.favoriteTables
    ? userDoc.state.doc.favoriteTables
    : [];

  const TableCard = props => {
    const { table } = props;
    const checked = Boolean(_find(favs, table));
    return (
      <Grid key={table.name} item xs={12} sm={6} md={4}>
        <StyledCard
          className={classes.card}
          overline={table.section}
          title={table.name}
          bodyContent={table.description}
          primaryLink={{
            to: `${routes.table}/${table.collection}${
              table.regional &&
              userClaims?.regions &&
              !userClaims?.regions.includes("GLOBAL")
                ? `?filters=%5B%7B%22key%22%3A%22region%22%2C%22operator%22%3A%22%3D%3D%22%2C%22value%22%3A%22${userClaims?.regions[0]}%22%7D%5D`
                : ""
            }`,
            label: "Open",
          }}
          secondaryAction={
            <Checkbox
              onClick={e => {
                userDoc.dispatch({
                  action: DocActions.update,
                  data: {
                    favoriteTables: checked
                      ? favs.filter(t => t.collection !== table.collection)
                      : [...favs, table],
                  },
                });
              }}
              checked={checked}
              icon={<FavoriteBorder />}
              checkedIcon={<Favorite />}
              name="checkedH"
            />
          }
        />
      </Grid>
    );
  };
  return (
    <main className={classes.root}>
      <AppBar />
      <Container>
        {(!userClaims?.roles || userClaims.roles.length === 0) && (
          <EmptyState
            Icon={SecurityIcon}
            message={"You don't have any permissions specified"}
            description={
              <>
                Please contact the Assistant <em>to</em> the Regional Manager of
                your branch then{" "}
                <Link
                  component="button"
                  onClick={() => {
                    window.location.reload();
                  }}
                  variant="body2"
                  style={{ verticalAlign: "baseline" }}
                >
                  refresh this page
                </Link>
                .
              </>
            }
          />
        )}
        {favs.length !== 0 && (
          <div key={"favorites"} className={classes.section}>
            <Typography variant="overline">favorites</Typography>
            <Divider className={classes.divider} />
            <Grid
              container
              spacing={4}
              justify="flex-start"
              className={classes.cardGrid}
            >
              {favs.map(table => (
                <TableCard table={table} />
              ))}
            </Grid>
          </div>
        )}
        {sections ? (
          Object.keys(sections).map(sectionName => (
            <div key={sectionName} className={classes.section}>
              <Typography variant="overline">
                {sectionName == "undefined" ? "Other" : sectionName}
              </Typography>
              <Divider className={classes.divider} />
              <Grid
                container
                spacing={4}
                justify="flex-start"
                className={classes.cardGrid}
              >
                {sections[sectionName].map(table => (
                  <TableCard table={table} />
                ))}
              </Grid>
            </div>
          ))
        ) : (
          <Loading />
        )}

        <Grid item className={classes.createTableContainer}>
          <CreateTableDialog
            createTable={(tableName: string, collectionName: string) => {
              if (createTable) {
                createTable(tableName, collectionName);
              }
            }}
            classes={{ fab: classes.createTableFab }}
          />
        </Grid>
      </Container>
    </main>
  );
};

export default TablesView;
