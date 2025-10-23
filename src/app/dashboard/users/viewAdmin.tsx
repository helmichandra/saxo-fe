import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdminData } from "@/models/Interface";

const ViewAdmin = (admin: AdminData) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <span className="relative hover:bg-gray-100 flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">
            Lihat
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail User</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border py-3 px-5">
            <div className="flex flex-row justify-between gap-1 py-3">
              <span className="font-medium">Nomor Admin:</span>
              <p className="uppercase">{admin.userNumber}</p>
            </div>
            <div className="flex flex-row justify-between gap-1 py-3">
              <span className="font-medium">Nama Lengkap:</span>
              <p className="capitalize">{admin.fullName}</p>
            </div>
            <div className="flex flex-row justify-between gap-1 py-3">
              <span className="font-medium">Email:</span>
              <p>{admin.email}</p>
            </div>
            <div className="flex flex-row justify-between gap-1 py-3">
              <span className="font-medium">Nomor Handphone:</span>
              <p className="capitalize">{admin.phoneNumber}</p>
            </div>
            <div className="flex flex-row justify-between gap-1 py-3">
              <span className="font-medium">Role:</span>
              <p>
                {admin.roleId === 777
                  ? "Super Admin"
                  : admin.roleId === 555
                  ? "Admin"
                  : "Member"}
              </p>
            </div>
            <div className="flex flex-row justify-between gap-1 py-3">
              <span className="font-medium">Status:</span>
              <p
                className={`border rounded-full px-3 py-1 flex justify-center font-bold ${
                  admin.isActive
                    ? "text-green-500 border-green-500"
                    : "text-red-500 border-red-500"
                }`}
              >
                {admin.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="flex flex-row justify-between gap-1 py-3">
              <span className="font-medium">Kredit Skor:</span>
              <p>                
                {admin.creditScore}
              </p>
            </div>
            <div className="border border-gray my-3"></div>
            {admin.adminNotes != null && admin.adminNotes !== "" && (
            <div className="flex flex-col bg-gray-100 rounded-lg justify-between gap-1 py-3 px-3">
              <span className="font-bold">Catatan Admin:</span>
                <p className="">{admin.adminNotes}</p>
            </div>
            )}
            <div className="flex flex-row justify-between gap-1 py-3">
              <span className="font-medium">Tanggal Registrasi:</span>
              <p className="capitalize">
                {new Date(admin.createdDate).toLocaleString("en-US", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </p>
            </div>
            <div className="flex flex-row justify-between gap-1 py-3">
              <span className="font-medium">Tanggal Modifikasi:</span>
              <p className="capitalize">
                {new Date(admin.modifiedDate).toLocaleString("en-US", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Tutup
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewAdmin;
