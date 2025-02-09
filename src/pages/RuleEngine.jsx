import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RuleEngine = () => {
  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-2 text-left">Motor de reglas</h1>

      <div className="w-full max-w-2xl">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-left mb-2">
              Agregar Nueva Regla
            </CardTitle>
            <Label className="mb-4 text-left text-gray-500">
              {" "}
              Aca podes crear reglas para automatizar acciones basadas en
              condiciones específicas.
            </Label>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Select onValueChange={() => {}}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Variable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Temp">Temperatura</SelectItem>
                    <SelectItem value="Hum">Humedad</SelectItem>
                    <SelectItem value="Soil Hum">Humedad del suelo</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={() => {}}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Condición" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="=">Igual a</SelectItem>
                    <SelectItem value=">=">Mayor que</SelectItem>
                    <SelectItem value="<">Menor que</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 align-center justify-center">
                <Input placeholder="Valor" type="number" className="mx-auto" />
              </div>
              <div className="flex flex-col gap-2">
                <Select onValueChange={() => {}}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Encender</SelectItem>
                    <SelectItem value="false">Apagar</SelectItem>
                    <SelectItem value="3">Poner en modo Timer</SelectItem>
                    <SelectItem value="5">Poner en modo Ciclos</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={() => {}}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Actuador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Luces</SelectItem>
                    <SelectItem value="false">Ventilador</SelectItem>
                    <SelectItem value="3">Extractor</SelectItem>
                    <SelectItem value="5">Intractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button>Add Rule</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Existing Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Example row */}
                <TableRow>
                  <TableCell>Example Rule</TableCell>
                  <TableCell>Example Condition</TableCell>
                  <TableCell>Example Action</TableCell>
                  <TableCell>
                    <Button>Edit</Button>
                    <Button>Delete</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RuleEngine;
