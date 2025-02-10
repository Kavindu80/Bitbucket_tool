import React, { useState, useEffect } from 'react';
import { Users, Search, Code, GitBranch, Clock, FolderGit, Briefcase, Layout } from 'lucide-react';

const WorkspaceDashboard = () => {
  const [contributors, setContributors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContributors();
  }, []);

  const fetchContributors = async () => {
    try {
      const response = await fetch('bitbucketdashboard.vercel.app/api/admin/all-contributors');
      if (!response.ok) throw new Error('Failed to fetch contributors');
      const data = await response.json();
      setContributors(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load contributors data');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Reorganize data by workspace first
  const groupedByWorkspaces = contributors.reduce((acc, contributor) => {
    contributor.commits.forEach(commit => {
      const workspaceName = commit.workspaceName || 'Default Workspace';
      
      if (!acc[workspaceName]) {
        acc[workspaceName] = {
          workspaceName,
          projects: {}
        };
      }
      
      if (!acc[workspaceName].projects[commit.projectName]) {
        acc[workspaceName].projects[commit.projectName] = {
          projectName: commit.projectName,
          contributors: {}
        };
      }
      
      const name = contributor.author.split('<')[0].trim();
      if (!acc[workspaceName].projects[commit.projectName].contributors[name]) {
        acc[workspaceName].projects[commit.projectName].contributors[name] = {
          name,
          avatar: name[0].toUpperCase(),
          commits: []
        };
      }
      
      acc[workspaceName].projects[commit.projectName].contributors[name].commits.push(commit);
    });
    
    return acc;
  }, {});

  const filteredWorkspaces = Object.values(groupedByWorkspaces)
    .filter(workspace => 
      workspace.workspaceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.values(workspace.projects).some(project => 
        project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.values(project.contributors).some(c => 
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    );

  const stats = {
    totalWorkspaces: filteredWorkspaces.length,
    totalProjects: filteredWorkspaces.reduce((acc, workspace) => 
      acc + Object.keys(workspace.projects).length, 0
    ),
    totalContributors: new Set(
      filteredWorkspaces.flatMap(workspace => 
        Object.values(workspace.projects).flatMap(project => 
          Object.values(project.contributors).map(c => c.name)
        )
      )
    ).size,
    totalCommits: filteredWorkspaces.reduce((acc, workspace) => 
      acc + Object.values(workspace.projects).reduce((sum, project) => 
        sum + Object.values(project.contributors)
          .reduce((commitSum, contributor) => commitSum + contributor.commits.length, 0)
        , 0)
      , 0)
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 shadow-xl"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      <div className="bg-gradient-to-r from-red-600 to-red-400 p-6 rounded-2xl text-white shadow-2xl border border-red-500">
        <p className="font-semibold text-lg">Error:</p>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Section */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 rounded-2xl shadow-2xl p-5 md:p-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-5 text-white transform transition-transform duration-200 hover:scale-[1.05] shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-300 text-sm uppercase tracking-wider">Workspaces</p>
                  <p className="text-4xl font-extrabold mt-1 text-white">{stats.totalWorkspaces}</p>
                </div>
                <Layout className="h-12 w-12 text-emerald-300 opacity-90" />
              </div>
            </div>
  
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white transform transition-transform duration-200 hover:scale-[1.05] shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm uppercase tracking-wider">Total Projects</p>
                  <p className="text-4xl font-extrabold mt-1 text-white">{stats.totalProjects}</p>
                </div>
                <FolderGit className="h-12 w-12 text-blue-300 opacity-90" />
              </div>
            </div>
  
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-5 text-white transform transition-transform duration-200 hover:scale-[1.05] shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-300 text-sm uppercase tracking-wider">Contributors</p>
                  <p className="text-4xl font-extrabold mt-1 text-white">{stats.totalContributors}</p>
                </div>
                <Users className="h-12 w-12 text-indigo-300 opacity-90" />
              </div>
            </div>
  
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-5 text-white transform transition-transform duration-200 hover:scale-[1.05] shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm uppercase tracking-wider">Total Commits</p>
                  <p className="text-4xl font-extrabold mt-1 text-white">{stats.totalCommits}</p>
                </div>
                <GitBranch className="h-12 w-12 text-purple-300 opacity-90" />
              </div>
            </div>
          </div>

         {/* Search Bar */}
<div className="relative mt-6">
  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
    <Search className="h-5 w-5 text-indigo-400" />
  </div>
  <input
    type="text"
    className="block w-full pl-12 pr-4 py-3.5 border border-gray-700 rounded-2xl bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white placeholder-gray-500 shadow-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/50 focus:outline-none"
    placeholder="Search workspaces, projects, or contributors..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>

        </div>

                 {/* Table Section */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-600">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-gray-100 shadow-md">
                    <th className="sticky top-0 px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider border-b border-indigo-500 first:pl-6 sm:first:pl-8">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Briefcase className="h-4 w-4 text-gray-200" />
                        <span>Workspace</span>
                      </div>
                    </th>
                    <th className="sticky top-0 px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider border-b border-indigo-500">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <FolderGit className="h-4 w-4 text-gray-200" />
                        <span>Project</span>
                      </div>
                    </th>
                    <th className="sticky top-0 px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider border-b border-indigo-500">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Users className="h-4 w-4 text-gray-200" />
                        <span>Contributors</span>
                      </div>
                    </th>
                    <th className="sticky top-0 px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider border-b border-indigo-500">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Code className="h-4 w-4 text-gray-200" />
                        <span>Recent Commits</span>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-700 bg-gray-800">
  {filteredWorkspaces.map(workspace => 
    Object.values(workspace.projects).map((project, projectIndex) =>
      Object.values(project.contributors).map((contributor, contributorIndex) => (
        <tr 
          key={`${workspace.workspaceName}-${project.projectName}-${contributor.name}`}
          className="hover:bg-gray-700 transition-colors duration-150"
        >
          {projectIndex === 0 && contributorIndex === 0 && (
            <td className="px-6 py-4 pl-8" rowSpan={Object.values(workspace.projects).reduce((acc, p) => acc + Object.keys(p.contributors).length, 0)}>
              <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-emerald-800 rounded-full text-sm font-medium shadow-sm">
                <Briefcase className="h-4 w-4 mr-2" />
                {workspace.workspaceName}
              </span>
            </td>
          )}
          {contributorIndex === 0 && (
            <td className="px-6 py-4" rowSpan={Object.keys(project.contributors).length}>
              <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-blue-800 rounded-full text-sm font-medium">
                <FolderGit className="h-4 w-4 mr-2" />
                {project.projectName}
              </span>
            </td>
          )}
          <td className="px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">{contributor.avatar}</span>
              </div>
              <div className="font-medium text-gray-200">{contributor.name}</div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="space-y-3">
              {contributor.commits.slice(0, 3).map((commit, index) => (
                <div 
                  key={commit.hash}
                  className={`p-3 rounded-lg border-l-4 transition-all duration-200 hover:scale-[1.01] ${
                    index === 0 
                      ? 'bg-blue-900 border-blue-500 shadow-sm'
                      : index === 1
                        ? 'bg-indigo-900 border-indigo-500'
                        : 'bg-purple-900 border-purple-500'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-200">{commit.message}</p>
                  <div className="flex items-center mt-1.5 text-xs text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(commit.date)}
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      ))
    )
  )}
</tbody>

              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDashboard;
