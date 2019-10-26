import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { MdNavigateNext, MdNavigateBefore } from 'react-icons/md';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container/index';
import { Loading, Owner, IssueList, Pagination, Button } from './styles';

class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loadingPage: true,
    filters: [
      { state: 'all', label: 'All Isssues', active: true },
      { state: 'open', label: 'Open', active: false },
      { state: 'closed', label: 'Closed', active: false },
    ],
    filterIndex: 0,
    page: 1,
    loading: false,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { filters } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filters.find(filter => filter.active).state,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loadingPage: false,
    });
  }

  loadFilters = async () => {
    const { match } = this.props;
    const { filters, filterIndex, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filters[filterIndex].state,
        per_page: 5,
        page,
      },
    });
    this.setState({ issues: response.data, loading: false });
  };

  handleFilters = async filterIndex => {
    await this.setState({ filterIndex });
    this.loadFilters();
  };

  handlePage = async action => {
    this.setState({ loading: true });
    const { page } = this.state;
    await this.setState({ page: action === 'back' ? page - 1 : page + 1 });
    this.loadFilters();
  };

  render() {
    const {
      repository,
      issues,
      loading,
      filters,
      filterIndex,
      page,
      loadingPage,
    } = this.state;

    if (loadingPage) {
      return (
        <Loading>
          <FaSpinner size={100} />
        </Loading>
      );
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          <Pagination active={filterIndex}>
            {filters.map((filter, index) => (
              <Button
                type="button"
                key={filter.state}
                onClick={() => this.handleFilters(index)}
              >
                {filter.label}
              </Button>
            ))}
          </Pagination>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Pagination>
          <Button
            /* loading={loading} */
            type="button"
            disabled={page < 2}
            onClick={() => this.handlePage('back')}
          >
            <MdNavigateBefore color="#fff" size={35} />
          </Button>
          <Button
            /* loading={loading} */
            type="button"
            onClick={() => this.handlePage('next')}
          >
            {' '}
            <MdNavigateNext color="#fff" size={35} />
            {/* {loading ? (
              <FaSpinner color="#fff" size={35} />
            ) : (
              <MdNavigateNext color="#fff" size={35} />
            )} */}
          </Button>
        </Pagination>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};

export default Repository;
