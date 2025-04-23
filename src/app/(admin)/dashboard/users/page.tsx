"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import userService, { User, UserDetails } from "@/services/userService";

// Layout Components
import DashboardHeader from "@/components/admin/DashboardHeader";
import Sidebar from "@/components/admin/Sidebar";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

// Icons
import {
  Users,
  Search,
  Edit,
  Trash2,
  Mail,
  Calendar,
  Ticket,
  Shield,
  Info,
  AlertTriangle,
} from "lucide-react";

// Form handling
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// Form schema for user editing
const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  isAdmin: z.boolean().default(false),
});

export default function UsersManagement() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // User details & edit states
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);

  // Loading state for operations
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);

  const router = useRouter();
  const { isAuthenticated, userId: currentUserId } = useAuthStore();

  // Form for editing user
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      isAdmin: false,
    },
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user details
  const fetchUserDetails = async (userId: string) => {
    try {
      setDetailsLoading(true);
      const data = await userService.getUserDetails(userId);
      setSelectedUser(data);
      setIsDetailsOpen(true);
    } catch (error) {
      toast.error("Failed to fetch user details");
      console.error(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle showing edit dialog
  const handleEditUser = (user: User) => {
    form.reset({
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
    setSelectedUser({ user, reservations: [] }); // Partial data, just for the form
    setIsEditDialogOpen(true);
  };

  // Handle showing delete dialog
  const handleDeleteUser = (userId: string) => {
    setUserIdToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  // Handle form submission to update user
  const onSubmit = async (values: z.infer<typeof userFormSchema>) => {
    if (!selectedUser) return;

    try {
      setUpdateLoading(true);
      await userService.updateUser(selectedUser.user._id, values);
      toast.success("User updated successfully");
      setIsEditDialogOpen(false);
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update user");
      console.error(error);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle user deletion
  const confirmDelete = async () => {
    if (!userIdToDelete) return;

    try {
      setDeleteLoading(true);
      await userService.deleteUser(userIdToDelete);
      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);

      // If the currently viewed user was deleted, close the details dialog
      if (selectedUser?.user._id === userIdToDelete) {
        setIsDetailsOpen(false);
      }

      fetchUsers(); // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchUsers();
    }
  }, [isAuthenticated, router]);

  // Add overlay when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [sidebarOpen]);

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 z-20 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-[#0A0A10] to-[#121218] text-white">
        <div className="flex h-screen">
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

          <div className="flex-1 flex flex-col md:ml-64 relative">
            <DashboardHeader toggleSidebar={toggleSidebar} />

            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="max-w-7xl mx-auto">
                {/* Page Title */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white">
                    User Management
                  </h1>
                  <p className="text-gray-400 mt-1">
                    View and manage user accounts
                  </p>
                </div>

                {/* User Management Section */}
                <Card className="bg-black/30 border-gray-800 backdrop-blur-md text-white">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>All Users</CardTitle>
                      <CardDescription className="text-gray-400">
                        {users.length} registered users
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          className="pl-9 pr-4 py-2 text-sm bg-black/30 border border-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-white w-[180px] lg:w-[250px]"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                      </div>
                    ) : users.length === 0 ? (
                      <div className="py-10 text-center">
                        <Users className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                        <h3 className="text-lg font-medium text-gray-300">
                          No users found
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto mt-1">
                          There are currently no registered users in the system.
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-800 hover:bg-transparent">
                            <TableHead className="text-gray-400">
                              User
                            </TableHead>
                            <TableHead className="text-gray-400">
                              Email
                            </TableHead>
                            <TableHead className="text-gray-400">
                              Joined
                            </TableHead>
                            <TableHead className="text-gray-400">
                              Role
                            </TableHead>
                            <TableHead className="text-gray-400 text-center">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow
                              key={user._id}
                              className={`border-gray-800 hover:bg-black/20 ${
                                user._id === currentUserId
                                  ? "bg-purple-900/10"
                                  : ""
                              }`}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gray-800">
                                    {user.avatar ? (
                                      <Image
                                        src={user.avatar}
                                        alt={user.name}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white font-medium">
                                        {user.name.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    {user._id === currentUserId && (
                                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-gray-900"></div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">
                                      {user.name}
                                      {user._id === currentUserId && (
                                        <span className="ml-2 text-xs text-green-400">
                                          (You)
                                        </span>
                                      )}
                                    </div>
                                    {user.isAdmin && (
                                      <div className="text-xs text-purple-400 mt-0.5 flex items-center">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Admin
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Mail className="h-3 w-3 mr-2 text-gray-400" />
                                  <span className="text-gray-300">
                                    {user.email}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                                  <span className="text-gray-300">
                                    {new Date(
                                      user.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    user.isAdmin
                                      ? "text-xs border-purple-800 bg-purple-900/30 text-purple-300"
                                      : "text-xs border-blue-800 bg-blue-900/30 text-blue-300"
                                  }
                                >
                                  {user.isAdmin ? "Administrator" : "User"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-blue-400 hover:text-blue-300"
                                    onClick={() => fetchUserDetails(user._id)}
                                    disabled={detailsLoading}
                                  >
                                    <Info className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-amber-400 hover:text-amber-300"
                                    onClick={() => handleEditUser(user)}
                                    disabled={updateLoading}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-400 hover:text-red-300"
                                    onClick={() => handleDeleteUser(user._id)}
                                    disabled={
                                      deleteLoading ||
                                      user._id === currentUserId
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    {filteredUsers.length > 0 &&
                      filteredUsers.length < users.length && (
                        <div className="mt-4 text-center text-sm text-gray-400">
                          Showing {filteredUsers.length} of {users.length} users
                        </div>
                      )}
                  </CardContent>
                </Card>
              </div>
            </main>

            {/* User Details Dialog */}
            {selectedUser && (
              <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>User Details</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Detailed information about the selected user.
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="profile" className="mt-4">
                    <TabsList className="bg-gray-800 border-gray-700">
                      <TabsTrigger value="profile">Profile</TabsTrigger>
                      <TabsTrigger value="reservations">
                        Reservations{" "}
                        {selectedUser.reservations.length > 0 && (
                          <Badge className="ml-2 bg-purple-600 text-white">
                            {selectedUser.reservations.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-4">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex flex-col items-center gap-3">
                          <div className="relative h-32 w-32 overflow-hidden rounded-full bg-gray-800">
                            {selectedUser.user.avatar ? (
                              <Image
                                src={selectedUser.user.avatar}
                                alt={selectedUser.user.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white text-4xl font-medium">
                                {selectedUser.user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          {selectedUser.user.isAdmin && (
                            <Badge className="bg-purple-600/20 text-purple-300 border-purple-600 px-3 py-1">
                              <Shield className="h-3 w-3 mr-1" /> Administrator
                            </Badge>
                          )}

                          {selectedUser.user._id === currentUserId && (
                            <Badge className="bg-green-600/20 text-green-300 border-green-600 px-3 py-1">
                              Current User
                            </Badge>
                          )}
                        </div>

                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium text-gray-400">
                                Name
                              </h3>
                              <p className="mt-1 text-white">
                                {selectedUser.user.name}
                              </p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-400">
                                Email
                              </h3>
                              <p className="mt-1 text-white">
                                {selectedUser.user.email}
                              </p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-400">
                                User ID
                              </h3>
                              <p className="mt-1 text-gray-300 text-sm font-mono">
                                {selectedUser.user._id}
                              </p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-400">
                                Joined Date
                              </h3>
                              <p className="mt-1 text-white">
                                {new Date(
                                  selectedUser.user.createdAt
                                ).toLocaleDateString()}{" "}
                                {new Date(
                                  selectedUser.user.createdAt
                                ).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>

                          {/* <div className="flex gap-2 pt-4">
                            <Button
                              variant="outline"
                              className="border-amber-600 text-amber-400 hover:bg-amber-900/20"
                              onClick={() => {
                                setIsDetailsOpen(false);
                                setTimeout(
                                  () => handleEditUser(selectedUser.user),
                                  100
                                );
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" /> Edit User
                            </Button>

                            {selectedUser.user._id !== currentUserId && (
                              <Button
                                variant="outline"
                                className="border-red-600 text-red-400 hover:bg-red-900/20"
                                onClick={() => {
                                  setIsDetailsOpen(false);
                                  setTimeout(
                                    () =>
                                      handleDeleteUser(selectedUser.user._id),
                                    100
                                  );
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete User
                              </Button>
                            )}
                          </div> */}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="reservations" className="mt-4">
                      {selectedUser.reservations.length === 0 ? (
                        <div className="text-center py-8">
                          <Ticket className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                          <h3 className="text-lg font-medium text-gray-300">
                            No Reservations
                          </h3>
                          <p className="text-gray-500 max-w-md mx-auto mt-1">
                            This user has not made any film reservations yet.
                          </p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[350px]">
                          <div className="space-y-4">
                            {selectedUser.reservations.map((reservation) => (
                              <div
                                key={reservation._id}
                                className="flex items-center gap-4 p-3 bg-black/20 rounded-lg border border-gray-800"
                              >
                                <div className="relative h-16 w-12 overflow-hidden rounded">
                                  <Image
                                    src={reservation.filmId.img}
                                    alt={reservation.filmId.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-white">
                                    {reservation.filmId.name}
                                  </h4>
                                  <div className="flex items-center gap-4 mt-1">
                                    <div className="text-xs text-gray-400">
                                      <Calendar className="h-3 w-3 inline mr-1" />
                                      {new Date(
                                        reservation.filmId.releaseDate
                                      ).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-purple-400">
                                      <Ticket className="h-3 w-3 inline mr-1" />
                                      Seat #{reservation.seatNumber}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </TabsContent>
                  </Tabs>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      className="border-gray-600 text-gray-300"
                      onClick={() => setIsDetailsOpen(false)}
                    >
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Update the user's information.
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6 mt-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter full name"
                              {...field}
                              className="bg-gray-800 border-gray-700 text-white"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter email address"
                              {...field}
                              className="bg-gray-800 border-gray-700 text-white"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isAdmin"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-800 p-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-gray-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="text-sm font-medium leading-none">
                              Admin Access
                            </FormLabel>
                            <p className="text-xs text-gray-400">
                              Grant this user administrator privileges
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    {selectedUser?.user._id === currentUserId &&
                      form.watch("isAdmin") === false && (
                        <div className="flex items-start gap-2 p-3 bg-amber-900/20 border border-amber-800/50 rounded-md">
                          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-300">
                            Warning: Removing your own admin access will prevent
                            you from accessing the admin dashboard in the
                            future.
                          </p>
                        </div>
                      )}

                    <DialogFooter className="gap-2">
                      <Button
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                        onClick={() => setIsEditDialogOpen(false)}
                        type="button"
                        disabled={updateLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={updateLoading}
                      >
                        {updateLoading ? (
                          <div className="flex items-center">
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                            Updating...
                          </div>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Delete User Confirmation Dialog */}
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={(open) => {
                if (!deleteLoading) setIsDeleteDialogOpen(open);
              }}
            >
              <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete User</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Are you sure you want to delete this user? This action
                    cannot be undone. All reservations for this user will also
                    be deleted.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end gap-3 mt-4">
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={confirmDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <div className="flex items-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Deleting...
                      </div>
                    ) : (
                      "Delete User"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <footer className="px-6 py-4 bg-black/40 border-t border-gray-800">
              <div className="text-center text-xs text-gray-500">
                Admin Panel v1.0 - © 2023 BookApp. All rights reserved.
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
