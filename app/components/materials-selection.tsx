import Card from "./card";
import Chip from "./chip";
import Heading2 from "./heading2";
import type { Material } from "../material-selection/page";

export default function MaterialSelection({
  materials,
  handleMaterialSelection,
  selectedMaterialIndex,
}: {
  materials: Material[];
  handleMaterialSelection: (index: number) => void;
  selectedMaterialIndex: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      {materials.map((material, index) => {
        return (
          <button
            type="button"
            key={material.code}
            onClick={() => handleMaterialSelection(index)}
            className={`text-left cursor-pointer ${
              selectedMaterialIndex !== index && "opacity-30"
            }`}
          >
            <Card>
              <Heading2>{material.name}</Heading2>

              <div className="mt-2 flex gap-2">
                {material.properties.map((property) => (
                  <Chip key={property}>{property}</Chip>
                ))}
              </div>
              <table className="mt-4">
                <tbody>
                  <tr>
                    <td>Price per cm³</td>
                    <td className="pl-2">{material.price}€</td>
                  </tr>
                  <tr>
                    <td>Lead time</td>
                    <td className="pl-2"> {material.leadTimeDays + 1} days</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
