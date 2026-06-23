import { NextResponse } from "next/server";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, email, password, role } = body;
    
    if (!nome || !email || !password) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }

    const q = query(collection(db, "admin_users"), where("email", "==", email));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return NextResponse.json({ error: "Email já cadastrado." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const docRef = await addDoc(collection(db, "admin_users"), {
      nome,
      email,
      password: hashedPassword,
      role: role || "admin",
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ id: docRef.id, success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar usuário." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID não fornecido." }, { status: 400 });

    await deleteDoc(doc(db, "admin_users", id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar usuário." }, { status: 500 });
  }
}
