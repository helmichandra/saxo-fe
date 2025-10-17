import React, { SyntheticEvent, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AdminData } from "@/models/Interface";
import { sessionId } from "@/lib/getSession";
import { logout } from "@/lib/auth";

const EditAdmin = (admin: AdminData) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<number>(admin.isActive ? 1 : 0);
  const [roleId, setRoleId] = useState<number>(admin.roleId);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    if(!sessionId){
        return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/superadmin/edit-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `${sessionId}`,
            dev_chronome: "yes",
          },
          body: JSON.stringify({
            userId: admin.userId,
            isActive,
            roleId,
          }),
        }
      );

      if (response.status === 401) {
        console.warn("Unauthorized. Redirecting...");
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Edit Admin Gagal",
          description: data.message,
          variant: "destructive",
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Edit Admin Berhasil",
        description: data.message,
        duration: 5000,
      });

      setLoading(false);
      setIsDialogOpen(false);
      location.reload();
    } catch (error) {
      toast({
        title: "Edit Admin Gagal",
        description: `` + error,
        variant: "destructive",
        duration: 5000,
      });
      setLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <span className="relative hover:bg-gray-100 flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">
            Edit
          </span>
        </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Admin: {admin.userNumber} - {admin.fullName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
        <div className="form-group mb-5">
          <Label>Status</Label>
          <Select value={isActive.toString()} onValueChange={(value) => setIsActive(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Aktif</SelectItem>
              <SelectItem value="0">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
          <Label>Role</Label>
          <Select value={roleId.toString()} onValueChange={(value) => setRoleId(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="777">Super Admin</SelectItem>
              <SelectItem value="555">Admin</SelectItem>
              <SelectItem value="1">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading} variant="default">
                  {loading ? (
                  <>
                    <span>Loading </span>
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="inline w-4 h-4 mr-3 text-white animate-spin"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      >
                      <path
                        d="M100 50.5A50 50 0 1 1 50 0v10a40 40 0 1 0 40 40h10z"
                        fill="currentColor"
                        />
                    </svg>
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAdmin;
