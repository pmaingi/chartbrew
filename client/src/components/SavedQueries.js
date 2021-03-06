import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  List, Button, Icon, Popup, Loader, Message, Modal, Header, Input
} from "semantic-ui-react";

import { getSavedQueries, updateSavedQuery, deleteSavedQuery } from "../actions/savedQuery";

/*
  Contains the project creation functionality
*/
class SavedQueries extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      error: "",
    };
  }

  componentDidMount() {
    this._getSavedQueries();
  }

  _getSavedQueries = () => {
    const { getSavedQueries } = this.props;

    this.setState({ loading: true });
    const { project, type } = this.props;
    getSavedQueries(project.id, type)
      .then(() => {
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ error: true, loading: false });
      });
  }

  _onEditQueryConfirmation = (query) => {
    this.setState({ editQuery: query });
  }

  _onEditQuery = () => {
    const { updateSavedQuery, project } = this.props;
    const { savedQuerySummary, editQuery } = this.state;

    this.setState({ editLoading: true });
    updateSavedQuery(project.id, editQuery.id, {
      summary: savedQuerySummary,
    })
      .then(() => {
        this.setState({
          editLoading: false,
          editQuery: null,
          savedQuerySummary: "",
        });
      })
      .catch(() => {
        this.setState({
          editLoading: false,
          editQuery: null,
          savedQuerySummary: "",
        });
      });
  }

  _onRemoveQueryConfirmation = (queryId) => {
    this.setState({ removeQuery: queryId });
  }

  _onRemoveQuery = () => {
    const { deleteSavedQuery, project } = this.props;
    const { removeQuery } = this.state;
    this.setState({ removeLoading: true });
    deleteSavedQuery(project.id, removeQuery)
      .then(() => {
        this.setState({
          removeQuery: null,
          removeLoading: false,
        });
      })
      .catch(() => {
        this.setState({
          removeQuery: null,
          removeLoading: false,
        });
      });
  }

  render() {
    const {
      loading, error, editQuery, editLoading, savedQuerySummary, removeQuery,
      removeLoading,
    } = this.state;
    const { savedQueries, onSelectQuery, selectedQuery } = this.props;
    return (
      <div style={styles.container}>
        <Loader active={loading} />

        {error
          && (
          <Message negative>
            <Message.Header>Could not get your saved queries</Message.Header>
            <p>Try to refresh the page or get in touch with us to fix the issue.</p>
          </Message>
          )}

        {savedQueries.length > 0
          && (
          <List divided selection verticalAlign="middle" style={{ maxHeight: 170, overflow: "auto" }}>
            {savedQueries.map((query) => {
              return (
                <List.Item key={query.id}>
                  <List.Content floated="right">
                    <Popup
                      trigger={(
                        <Button
                          icon
                          positive
                          onClick={() => onSelectQuery(query)}
                        >
                          <Icon name="check" />
                        </Button>
                      )}
                      content="Use this query"
                    />

                    <Popup
                      trigger={(
                        <Button
                          icon
                          secondary
                          loading={editQuery && editLoading && editQuery.id === query.id}
                          onClick={() => this._onEditQueryConfirmation(query)}
                        >
                          <Icon name="pencil" />
                        </Button>
                      )}
                      content="Edit the summary"
                    />

                    <Popup
                      trigger={(
                        <Button
                          icon
                          negative
                          onClick={() => this._onRemoveQueryConfirmation(query.id)}
                        >
                          <Icon name="x" />
                        </Button>
                      )}
                      content="Remove the saved query"
                    />
                  </List.Content>

                  {selectedQuery === query.id && <List.Icon name="checkmark" color="green" />}
                  <List.Content verticalAlign="middle">
                    <List.Header>{query.summary}</List.Header>
                    <List.Description>{`created by ${query.User.name} ${query.User.surname}`}</List.Description>
                  </List.Content>
                </List.Item>
              );
            })}
          </List>
          )}
        {savedQueries.length < 1 && !loading
          && <p><i>{"The project doesn't have any saved queries yet"}</i></p>}

        {/* Update query modal */}
        <Modal open={!!editQuery} size="small" onClose={() => this.setState({ editQuery: null })}>
          <Header
            content="Edit the query"
            inverted
          />
          <Modal.Content>
            <Header size="small">Edit the description of the query</Header>
            <Input
              placeholder="Type a summary here"
              value={savedQuerySummary ? savedQuerySummary /* eslint-disable-line */
                : editQuery ? editQuery.summary : ""}
              fluid
              onChange={(e, data) => this.setState({ savedQuerySummary: data.value })}
            />
          </Modal.Content>
          <Modal.Actions>
            <Button
              onClick={() => this.setState({ editQuery: null })}
            >
              Close
            </Button>
            <Button
              primary
              disabled={!savedQuerySummary}
              icon
              labelPosition="right"
              loading={editLoading}
              onClick={this._onEditQuery}
            >
              <Icon name="checkmark" />
              Save the query
            </Button>
          </Modal.Actions>
        </Modal>

        {/* Update query modal */}
        <Modal open={!!removeQuery} size="small" basic onClose={() => this.setState({ removeQuery: null })}>
          <Header
            icon="exclamation triangle"
            content="Are you sure you want to remove the query?"
            inverted
          />
          <Modal.Content>
            <p>{"This action will be permanent."}</p>
          </Modal.Content>
          <Modal.Actions>
            <Button
              onClick={() => this.setState({ removeQuery: null })}
            >
              Close
            </Button>
            <Button
              negative
              icon
              labelPosition="right"
              loading={removeLoading}
              onClick={this._onRemoveQuery}
            >
              <Icon name="x" />
              Remove the query
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

const styles = {
  container: {
  },
};

SavedQueries.defaultProps = {
  onSelectQuery: () => {},
  selectedQuery: -1,
  type: "",
};

SavedQueries.propTypes = {
  project: PropTypes.object.isRequired,
  savedQueries: PropTypes.array.isRequired,
  getSavedQueries: PropTypes.func.isRequired,
  updateSavedQuery: PropTypes.func.isRequired,
  deleteSavedQuery: PropTypes.func.isRequired,
  onSelectQuery: PropTypes.func,
  selectedQuery: PropTypes.number,
  type: PropTypes.string,
};

const mapStateToProps = (state) => {
  return {
    project: state.project.active,
    savedQueries: state.savedQuery.data,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getSavedQueries: (projectId, type) => dispatch(getSavedQueries(projectId, type)),
    updateSavedQuery: (projectId, savedQueryId, data) => (
      dispatch(updateSavedQuery(projectId, savedQueryId, data))
    ),
    deleteSavedQuery: (projectId, savedQueryId) => (
      dispatch(deleteSavedQuery(projectId, savedQueryId))
    ),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SavedQueries);
