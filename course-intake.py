import csv
import json

def main():

    ### FORMAT OF INPUT:
    # CSV FORMAT: (ensure columns are named the same, verbatim)
    # | number | advisor | facilitators | description |

    # AS SUCH, YOUR CSV MUST HAVE A HEADER ROW WITH THE FOLLOWING:
    # number,advisor,facilitators,description

    # EXAMPLE CSV INPUT ROW FOR CMSC389E
    # CMSC389E,Roger Eastman,"Akilesh Praveen,Dhanvee Ivaturi","A great class about Minecraft and Computer Science"

    # IMPORTANT: Make sure you update 'counter' below to the most recent ID not used in catalog.js

    # get STIC data file
    courses_data = "/Users/aki/Documents/UMD/STICS/2021stics.csv"
    try:
        f = open(courses_data)
    except FileNotFoundError as e:
        print(e)
    
    reader = csv.DictReader(f)
    
    counter = 109
    results = []

    for row in reader:

        row["id"] = counter
        row["title"] = ""
        row["website"] = "null"
        row["department"] = row["number"][0:4]
        row["number"] = row["number"][4:]
        row["credits"] = 1
        counter += 1

        # reformat to give each facilitator an email address field as well
        row["facilitators"] = [ {"name": x, "email": ""} for x in row["facilitators"].split(',') ]

        raw_out = json.dumps(row, indent=2)

        edited_out = remove_quotes(raw_out)

        print(edited_out + ',')

def remove_quotes(input):
    # remove unnecessary quotes from json output
    to_change = {
        '"name"':'name',
        '"id"':'id',
        '"advisor"':'advisor',
        '"email"':'email',
        '"description"':'description',
        '"facilitators"':'facilitators',
        '"number"':'number',
        '"website"':'website',
        '"title"':"title",
        '"department"':'department',
        '"credits"':'credits',
        '"null"':'null'
    }

    for k,v in to_change.items():
        input = input.replace(k,v)

    return input
    

if __name__ == "__main__":
    main()