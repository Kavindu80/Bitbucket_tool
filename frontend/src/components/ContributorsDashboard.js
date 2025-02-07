import React, { useState, useEffect } from 'react';
import { Users, Search, Code, GitBranch, Clock } from 'lucide-react';

const ContributorsDashboard = () => {
  const [contributors, setContributors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContributors();
  }, []);

  const fetchContributors = async () => {
    try {
      const response = await fetch('https://bitbucket-tool.vercel.app/api/admin/all-contributors');
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

  // Group and sort commits by contributor and project
  const groupedContributors = contributors.reduce((acc, contributor) => {
    const name = contributor.author.split('<')[0].trim();
    if (!acc[name]) {
      acc[name] = {
        name,
        avatar: name[0].toUpperCase(),
        projects: {}
      };
    }
    
    contributor.commits.forEach(commit => {
      if (!acc[name].projects[commit.projectName]) {
        acc[name].projects[commit.projectName] = [];
      }
      acc[name].projects[commit.projectName].push(commit);
    });
    
    // Sort commits by date for each project
    Object.values(acc[name].projects).forEach(commits => {
      commits.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    
    return acc;
  }, {});

  const filteredContributors = Object.values(groupedContributors)
    .filter(contributor => contributor.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(contributor => ({
      ...contributor,
      // Sort projects by most recent commit
      projects: Object.fromEntries(
        Object.entries(contributor.projects)
          .sort(([, aCommits], [, bCommits]) => 
            new Date(bCommits[0].date) - new Date(aCommits[0].date)
          )
      )
    }));

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-50">
          <div className="text-center">
            {/* Enhanced spinner for a sleeker look */}
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-lg"></div>
            
            {/* Improved text styling */}
            <p className="text-gray-800 font-semibold text-xl tracking-wider">
              Loading contributors data...
            </p>
    
            {/* Optional - Additional loading hint */}
            <p className="mt-2 text-gray-600 text-sm">
              This may take a moment, please hang tight.
            </p>
          </div>
        </div>
      );
    }
    
    

    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-50 p-8">
          <div className="max-w-2xl mx-auto bg-red-50 border-l-8 border-red-500 text-red-800 p-6 rounded-2xl shadow-xl">
            <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
            <p className="text-md leading-relaxed">
              {error}
            </p>
          </div>
        </div>
      );
    }
    

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Centered Stats Section */}
          <div className="relative text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-20 rounded-3xl shadow-lg"></div>
            <div className="relative p-8 space-y-8">
              <h2 className="text-4xl font-semibold text-white sm:text-5xl tracking-tight">
                Contributors Dashboard
              </h2>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                Gain insights into the contributions and activity of your team members across projects.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Total Contributors Stat Card */}
                <div className="group bg-gray-800 rounded-3xl shadow-xl p-8 flex items-center space-x-6 transform hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out">
                  <div className="bg-blue-900 p-5 rounded-xl group-hover:bg-blue-800 transition duration-300">
                    <Users className="w-12 h-12 text-blue-500 group-hover:text-blue-400" />
                  </div>
                  <div className="text-left text-white">
                    <p className="text-sm text-gray-400 font-medium">Total Contributors</p>
                    <p className="text-4xl font-extrabold">{Object.keys(groupedContributors).length}</p>
                  </div>
                </div>
    
                {/* Total Commits Stat Card */}
                <div className="group bg-gray-800 rounded-3xl shadow-xl p-8 flex items-center space-x-6 transform hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out">
                  <div className="bg-indigo-900 p-5 rounded-xl group-hover:bg-indigo-800 transition duration-300">
                    <Code className="w-12 h-12 text-indigo-500 group-hover:text-indigo-400" />
                  </div>
                  <div className="text-left text-white">
                    <p className="text-sm text-gray-400 font-medium">Total Commits</p>
                    <p className="text-4xl font-extrabold">
                      {contributors.reduce((sum, c) => sum + c.commits.length, 0)}
                    </p>
                  </div>
                </div>
    
                {/* Active Projects Stat Card */}
                <div className="group bg-gray-800 rounded-3xl shadow-xl p-8 flex items-center space-x-6 transform hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out">
                  <div className="bg-purple-900 p-5 rounded-xl group-hover:bg-purple-800 transition duration-300">
                    <GitBranch className="w-12 h-12 text-purple-500 group-hover:text-purple-400" />
                  </div>
                  <div className="text-left text-white">
                    <p className="text-sm text-gray-400 font-medium">Active Projects</p>
                    <p className="text-4xl font-extrabold">
                      {new Set(
                        contributors.flatMap((c) =>
                          c.commits.map((commit) => commit.projectName)
                        )
                      ).size}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
    
          
        
    
  
        {/* Search Bar */}
<div className="relative max-w-3xl mx-auto">
  {/* Search Icon */}
  <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
    <Search className="h-6 w-6 text-gray-400" />
  </div>
  {/* Input Field */}
  <input
    type="text"
    className="block w-full pl-14 pr-6 py-5 border-2 border-gray-600 rounded-full bg-gray-800 text-lg text-white placeholder-gray-500 focus:ring-4 focus:ring-blue-500 focus:border-transparent focus:shadow-2xl transition-all duration-300 ease-in-out"
    placeholder="Search contributors..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  {/* Search Button */}
  <div className="absolute inset-y-0 right-0 flex items-center pr-6">
  <button
    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full px-6 py-3 shadow-xl hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 ease-in-out"
    onClick={() => fetchContributors()} // Replace with your search logic if applicable
  >
    <span className="text-lg font-medium">Search</span>
  </button>
</div>

</div>


  
{/* Table Section with Dark Gradient Theme */}
<div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-600">
      <thead>
        <tr className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-gray-100 shadow-md">
          <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider border-b border-indigo-500">
            Contributor
          </th>
          <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider border-b border-indigo-500">
            Project
          </th>
          <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider border-b border-indigo-500">
            Recent Three Commits
          </th>
          <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider border-b border-indigo-500">
            Latest Activity
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-700">
        {filteredContributors.flatMap((contributor) =>
          Object.entries(contributor.projects).map(([projectName, commits], projectIndex) => (
            <tr
              key={`${contributor.name}-${projectName}`}
              className="hover:bg-gray-800 transition-colors duration-200"
            >
              {projectIndex === 0 ? (
                <td className="px-6 py-4" rowSpan={Object.keys(contributor.projects).length}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">{contributor.avatar}</span>
                    </div>
                    <div className="font-medium text-gray-200">{contributor.name}</div>
                  </div>
                </td>
              ) : null}
              <td className="px-6 py-4">
                <span className="px-4 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 text-gray-100 rounded-full text-sm font-medium shadow-md">
                  {projectName}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-3">
                  {commits.slice(0, 3).map((commit, index) => (
                    <div
                      key={commit.hash}
                      className={`p-2 rounded-lg shadow-md ${
                        index === 0
                          ? 'bg-gradient-to-r from-blue-800 to-blue-900 border-l-4 border-blue-400'
                          : index === 1
                          ? 'bg-gradient-to-r from-indigo-800 to-indigo-900 border-l-4 border-indigo-400'
                          : 'bg-gradient-to-r from-purple-800 to-purple-900 border-l-4 border-purple-400'
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-200">{commit.message}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(commit.date)}
                      </div>
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm">
                  <div className="font-medium text-gray-200">
                    {formatDate(commits[0].date)}
                  </div>
                  <div className="text-gray-400 mt-1">Latest commit</div>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

      </div>
    </div>
  );
};

export default ContributorsDashboard;
