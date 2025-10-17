import React, { SyntheticEvent, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/models/Interface";
import { useToast } from "@/hooks/use-toast";
import { sessionId } from "@/lib/getSession";
import { logout } from "@/lib/auth";

const EditUser = (user: User) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [fullName, setFullName] = useState(user.fullName || "");
  const [email, setEmail] = useState(user.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [isActive, setIsActive] = useState<number>(user.isActive ? 1 : 0);
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
        `${process.env.NEXT_PUBLIC_API_URL}/user/admin/users/edit`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            dev_chronome: "yes",
            authorization: `${sessionId}`,
          },
          body: JSON.stringify({
            userId: user.userId,
            userFullName: fullName,
            email: email,
            phoneNumber: phoneNumber,
            isActive: isActive,
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
          title: "Edit User Gagal",
          description: data.message,
          variant: "destructive",
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Edit User Berhasil",
        description: data.message,
        duration: 5000,
      });

      setLoading(false);
      setIsDialogOpen(false);
      location.reload();
    } catch (error) {
      console.error("Error submitting the form:", error);
      toast({
        title: "Edit User Gagal",
        description: "" + error,
        variant: "destructive",
        duration: 5000,
      });
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <span className="relative hover:bg-gray-100 flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">
            Edit
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit User: <span className="uppercase">{user.userNumber}</span>
            </DialogTitle>
            <DialogDescription>
              Perbarui informasi user di bawah ini dan simpan perubahan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-5">
              <Label required>Nama Lengkap</Label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                required
              />
            </div>
            <div className="form-group mb-5">
              <Label required>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>
            <div className="form-group mb-5">
              <Label required>Nomor Handphone</Label>
              <Input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number"
                required
              />
            </div>
            <div className="form-group mb-5">
              <Label required>Status Aktif</Label>
              <Select
                value={isActive.toString()}
                onValueChange={(value) => setIsActive(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Aktif</SelectItem>
                  <SelectItem value="0">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit" variant="default" disabled={loading}>
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
    </div>
  );
};

export default EditUser;
