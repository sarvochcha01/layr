"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  Globe,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();

  const handleNewProject = () => {
    router.push("/projects?openDialog=true");
  };

  const handleViewAllProjects = () => {
    router.push("/projects");
  };

  const stats = [
    {
      title: "Total Projects",
      value: "12",
      change: "+2 this month",
      icon: BarChart3,
      color: "text-blue-600",
    },
    {
      title: "Active Sites",
      value: "8",
      change: "+1 this week",
      icon: Globe,
      color: "text-green-600",
    },
    {
      title: "Total Views",
      value: "24.5K",
      change: "+12% from last month",
      icon: Eye,
      color: "text-purple-600",
    },
    {
      title: "Team Members",
      value: "4",
      change: "No change",
      icon: Users,
      color: "text-orange-600",
    },
  ];

  const recentProjects = [
    {
      name: "E-commerce Landing",
      status: "Published",
      lastModified: "2 hours ago",
      views: "1.2K",
    },
    {
      name: "Portfolio Site",
      status: "Draft",
      lastModified: "1 day ago",
      views: "0",
    },
    {
      name: "Company Website",
      status: "Published",
      lastModified: "3 days ago",
      views: "3.4K",
    },
    {
      name: "Blog Template",
      status: "In Review",
      lastModified: "1 week ago",
      views: "856",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={handleNewProject}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="p-6 bg-card border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.change}
                  </p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <Button variant="outline" size="sm" onClick={handleViewAllProjects}>
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {recentProjects.map((project, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{project.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {project.lastModified}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {project.views} views
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      project.status === "Published"
                        ? "bg-green-100 text-green-800"
                        : project.status === "Draft"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {project.status}
                  </span>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

          <div className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={handleNewProject}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Project
            </Button>

            <Button className="w-full justify-start" variant="outline">
              <Globe className="h-4 w-4 mr-2" />
              Deploy Site
            </Button>

            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>

            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Invite Team Member
            </Button>
          </div>

          {/* Mini Calendar */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              This Week
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mon</span>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tue</span>
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wed</span>
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thu</span>
                <span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fri</span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Site Performance</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              7 days
            </Button>
            <Button variant="outline" size="sm">
              30 days
            </Button>
            <Button variant="outline" size="sm">
              90 days
            </Button>
          </div>
        </div>

        <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              Chart visualization would go here
            </p>
            <p className="text-sm text-muted-foreground">
              Connect analytics to see real data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
